"use client";

import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Contract, ethers, TransactionReceipt } from "ethers";
import ContentEditable from "react-contenteditable";
import toast from "react-hot-toast";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { FiSend } from "react-icons/fi";
import { chatGptABI } from "../../abis/chatgpt";
import ChatContext from "./chatContext";
import { ChatMessage } from "./interface";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

import "./index.scss";
import useChatHook from "./useChatHook";
import Analysis from "./Analysis";

const HTML_REGULAR =
  /<(?!img|table|\/table|thead|\/thead|tbody|\/tbody|tr|\/tr|td|\/td|th|\/th|br|\/br).*?>/gi;

export interface ChatProps {}

export interface ChatGPInstance {
  setConversation: (messages: ChatMessage[]) => void;
  getConversation: () => ChatMessage[];
  focus: () => void;
}

// @ts-expect-error : props is needed for the galadriel LLM (not used here but by galadriel)
const ChatSingleRequest = (props: ChatProps, ref: React.RefObject<ChatGPInstance>) => {
  const {
    debug,
    saveMessages,
    onToggleSidebar,
    forceUpdate,
    saveChatId,
  } = useContext(ChatContext);
  const chatProvider = useChatHook();
  const currentChatRef = chatProvider.currentChatRef;
  const [requestHast, setRequestHash] = useState<string>("");

  const provider = new ethers.JsonRpcProvider("https://devnet.galadriel.com");
  const wallet = new ethers.Wallet(import.meta.env.VITE_WALLET_PK, provider);

  const [isLoading, setIsLoading] = useState(false);
  const [, setIsTxLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [currentMessage] = useState<string>("");

  const conversationRef = useRef<ChatMessage[]>();
  const textAreaRef = useRef<HTMLElement>(null);
  const conversation = useRef<ChatMessage[]>([]);

  const bottomOfChatRef = useRef<HTMLDivElement>(null);
  const sendMessage = useCallback(
    async (messageContent: string, ipfsHash: string = "") => {
      if (!isLoading) {
        const input = messageContent.replace(HTML_REGULAR, "") || "";

        if (input.length < 1) {
          toast.error("Please type a message to continue.");
          return;
        }
        if (!wallet) {
          toast.error("Not connected");
          return;
        }

        const message = [...conversation.current];
        conversation.current = [
          ...conversation.current,
          { content: input, role: "user" },
        ];
        setMessage("");
        setIsLoading(true);
        setIsTxLoading(true);
        try {
          const signer = wallet;
          // Personal Agent
          const contract = new Contract(CONTRACT_ADDRESS || "", chatGptABI, signer);
          const tx = await contract.startChat(input);
          const receipt = await tx.wait();
          const chatId = getChatId(receipt, contract);
          if (chatId) {
            saveChatId?.(chatId);
          }
          setIsTxLoading(false);
          if (receipt && receipt.status) {
            setRequestHash(receipt.hash); 
            conversation.current = [
              ...message,
              {
                content: input,
                role: "user",
                transactionHash: receipt.hash,
              },
            ];
            if (chatId) {
              if (currentChatRef?.current) {
                currentChatRef.current.chatId = chatId;
              }

              while (true) {
                const newMessages: ChatMessage[] = await getNewMessages(contract, chatId, conversation.current.length);
                if (newMessages) {
                  const lastMessage = newMessages.at(-1);
                  if (lastMessage) {
                    if (lastMessage.role === "assistant") {
                      console.log("lastMessage.content", lastMessage.content)
                      // don't display but call the other LLMs
                      // Verify agent
                      const contract2 = new Contract("0x9Cc7E153254237f08d743599AABBF13364e47417" || "", chatGptABI, signer);
                      const tx = await contract2.startChat(`You are an agent verifying the work of other agents. You verify and correct if needed. Always return a valid json, without empty field. Here is the query : ${input} ------ the work done by the other agent is ------ : ${lastMessage.content}`);
                      const receipt2 = await tx.wait();
                      const chatId2 = getChatId(receipt2, contract2);
                      if (chatId2) {
                        while (true) {
                          const newMessages: ChatMessage[] = await getNewMessages(contract2, chatId2, conversation.current.length);
                        if (newMessages) {
                          const lastMessage = newMessages.at(-1);
                          if (lastMessage) {
                            if (lastMessage.role === "assistant") {
                              console.log("lastMessage.content", lastMessage.content)
                              conversation.current = [
                                ...conversation.current,
                                { content: lastMessage.content, role: "assistant" },
                              ];
                              break;
                            }
                          }
                          }
                        }
                      }
                      break;
                    } else {
                      // Simple solution to show function results, not ideal
                      conversation.current = [
                        ...conversation.current,
                        { content: lastMessage.content, role: "user" },
                      ];
                    }
                  }
                }
                await new Promise((resolve) => setTimeout(resolve, 2000));
              }
            }
          }
          setIsLoading(false);
        } catch (error: any) {
          console.error(error);
          toast.error(error.message);
          setIsLoading(false);
          setIsTxLoading(false);
        }
      }
    },
    [currentChatRef, debug, isLoading]
  );

  function getChatId(receipt: TransactionReceipt, contract: Contract) {
    let chatId;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "ChatCreated") {
          // Second event argument
          chatId = ethers.toNumber(parsedLog.args[1])
        }
      } catch (error) {
        // This log might not have been from your contract, or it might be an anonymous log
        console.error("Could not parse log:", log);
      }
    }
    return chatId;
  }

  async function getNewMessages(
    contract: Contract,
    chatId: number,
    currentMessagesCount: number
  ): Promise<ChatMessage[]> {
    const messages = await contract.getMessageHistoryContents(chatId);
    const roles = await contract.getMessageHistoryRoles(chatId);

    console.log(messages, roles)

    const newMessages: ChatMessage[] = [];
    messages.forEach((_message: unknown, i: number) => {
      if (i >= currentMessagesCount) {
        newMessages.push({
          role: roles[i],
          content: messages[i],
        });
      }
    });
    return newMessages;
  }

  const handleKeypress = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.keyCode == 13 && !e.shiftKey) {
        e.preventDefault();
        if (textAreaRef.current?.innerHTML) {
          sendMessage(textAreaRef.current?.innerHTML);
        }
      }
    },
    [sendMessage]
  );

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "50px";
      textAreaRef.current.style.height = `${
        textAreaRef.current.scrollHeight + 2
      }px`;
    }
  }, [message, textAreaRef]);

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation, currentMessage]);

  useEffect(() => {
    conversationRef.current = conversation.current;
    if (currentChatRef?.current?.id) {
      saveMessages?.(conversation.current);
    }
  }, [currentChatRef, conversation.current, saveMessages]);

  useEffect(() => {
    if (!isLoading) {
      textAreaRef.current?.focus();
    }
  }, [isLoading]);

  // @ts-expect-error flagged by ts but working
  useImperativeHandle(ref, () => {
    return {
      setConversation(messages: ChatMessage[]) {
        conversation.current = messages;
        forceUpdate?.();
      },
      getConversation() {
        return conversationRef.current;
      },
      focus: () => {
        textAreaRef.current?.focus();
      },
      sendMessage,
    };
  });

  return (
    <div
      className="flex flex-col h-full relative gap-3 mt-4"
      style={{ backgroundColor: "var(--background-color)" }}
    >
      <div className="flex-1 overflow-y-auto" style={{ height: "100%" }}>
        {requestHast && (
          <div>
            hash:
            <a className="underline pl-2 text-xs"
              href={`https://explorer.galadriel.com/tx/${requestHast}`}
              target="_blank" rel="noopener noreferrer"
            >
              {requestHast.slice(0, 20) + '...'}
            </a>
          </div>
        )}
        {conversation.current.map((item, index) => (
          <Analysis key={index} message={item} />
        ))}
        {currentMessage && (
          <Analysis message={{ content: currentMessage, role: "assistant" }} />
        )}
        {isLoading && (
          conversation.current.length < 3 ? (
            <div className="pt-4">
              Searching for the truth <span className="loading loading-dots loading-md ml-2" style={{ marginBottom: "-10px"}}></span>
            </div>
          ) : (
            <div className="pt-4">
              Waiting for response...
            </div>
          )
        )}
        <div ref={bottomOfChatRef}></div>
      </div>
      {conversation.current.length >= 2 &&
        <div className="px-4 pb-3 w-3/4 mx-auto">
          <div className="flex justify-between items-end gap-3 relative">
            <div
              className="flex-1 rounded-3xl chat-textarea border"
              style={{ borderWidth: "1px" }}
            >
              <ContentEditable
                innerRef={textAreaRef}
                style={{
                  minHeight: "60px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  padding: "18px",
                }}
                className="text-base"
                html={message}
                disabled={isLoading}
                onChange={(e) => {
                  setMessage(e.target.value.replace(/<\/?[^>]+(>|$)/g, ""));
                }}
                onKeyDown={(e) => {
                  handleKeypress(e);
                }}
              />
              <div className="rt-TextAreaChrome"></div>
            </div>
            <div className="absolute right-0 pr-4 bottom-2 flex gap-3">
              {isLoading && (
                <span className="loading loading-dots loading-md"></span>
              )}
              <div className="tooltip" data-tip="Send Message">
                <button
                  className="btn btn-outline btn-gray rounded-xl cursor-pointer"
                  // @ts-expect-error flagged by ts but working
                  onClick={sendMessage}
                  disabled={isLoading}
                >
                  <FiSend className="text-xl" />
                </button>
              </div>
              <div className="tooltip" data-tip="Toggle Sidebar">
                <button
                  className="btn btn-outline btn-gray rounded-xl md:hidden cursor-pointer"
                  onClick={onToggleSidebar}
                  disabled={isLoading}
                >
                  <AiOutlineUnorderedList className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
};

// @ts-expect-error type alert 
export default forwardRef<ChatGPInstance, ChatProps>(ChatSingleRequest);