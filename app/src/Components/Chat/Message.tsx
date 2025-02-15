'use client'

import { useCallback, useState } from 'react'
import { FaRegCopy } from 'react-icons/fa'
import { HiUser } from 'react-icons/hi'
import { RiRobot2Line } from 'react-icons/ri'
import { ChatMessage } from './interface'

export interface MessageProps {
  message: ChatMessage
}

const Message = (props: MessageProps) => {
  const { role, content, transactionHash } = props.message
  const isUser = role === 'user'
  const [, setTooltipOpen] = useState<boolean>(false)

  return (
    <div className="message flex gap-4 mb-5">
      <div className="avatar">
        <div className={`size-8 ${isUser ? '' : 'bg-green-500'} rounded-full`}>
          {isUser ? <HiUser className="text-2xl" /> : <RiRobot2Line className="text-2xl" />}
        </div>
      </div>
      <div className="flex-1 pt-1 break-all">
        {isUser ? (
          <>
            <div
              className="userMessage"
              dangerouslySetInnerHTML={{
                __html: content.replace(
                  /<(?!\/?br\/?.+?>|\/?img|\/?table|\/?thead|\/?tbody|\/?tr|\/?td|\/?th.+?>)[^<>]*>/gi,
                  ''
                )
              }}
            ></div>
            {transactionHash && (
              <div className="flex gap-4 items-center pt-2 pb-8 text-sm">
                <div>
                  Transaction hash:
                  <a
                    className="underline pl-2"
                    href={`https://explorer.galadriel.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {transactionHash}
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {content}
          </div>
        )}
      </div>
    </div>
  )
}

export default Message
