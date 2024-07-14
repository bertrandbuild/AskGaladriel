"use client";

import { ChatMessage } from "./interface";
import { useEffect, useState } from "react";

export interface MessageProps {
  message: ChatMessage;
}

function isValidJSON(str: string) {
  try {
    console.log("str", str);
    const json = JSON.parse(str);
    console.log("json", json);
    return json
  } catch (e) {
    return false;
  }
}

const Analysis = (props: MessageProps) => {
  const { role, content: strContent } = props.message;
  const [img, setImg] = useState('https://i.ibb.co/7SthJSs/Screenshot-2024-07-14-at-04-25-44.png');
  
  const isUser = role === "user";
  let content = strContent.replace(/\/\/.*$/gm, "");
  content = content.replace(/\/\*[\s\S]*?\*\//gm, "");
  content = content.replace(/```json|```/g, "");
  content = content.trim();
  if (!isValidJSON(content)) return;
  const json = isValidJSON(content);

  return (
    <div className="message flex gap-4 mb-5 m-auto">
      <div className="flex-1 pt-1 break-all">
        {!isUser && (
          <div className="flex flex-col gap-4">
            <div className="stats lg:stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title">Team 🙋‍♂️</div>
                <div className={`stat-value ${json.teamRiskScore < 3 ? 'text-green-500' : json.teamRiskScore > 3 ? 'text-red-500' : ''}`}>{json.teamRiskScore}</div>
                {/* <div className="stat-desc">Jan 1st - Feb 1st</div> */}
              </div>

              <div className="stat">
                <div className="stat-title">Twitter 🔥</div>
                <div className={`stat-value ${json.twitterSentimentRiskScore < 3 ? 'text-green-500' : json.twitterSentimentRiskScore > 3 ? 'text-red-500' : ''}`}>{json.twitterSentimentRiskScore}</div>
                {/* <div className="stat-desc">↗︎ 400 (22%)</div> */}
              </div>

              <div className="stat">
                <div className="stat-title">Token 🔗</div>
                <div className={`stat-value ${json.tokenomicsRiskScore < 3 ? 'text-green-500' : json.tokenomicsRiskScore > 3 ? 'text-red-500' : ''}`}>{json.tokenomicsRiskScore}</div>
                {/* <div className="stat-desc">↘︎ 90 (14%)</div> */}
              </div>
            </div>
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="avatar satoshi"
                    src={img}
                  />
                </div>
              </div>
              <div className="chat-header">
                Galadriel
              </div>
              <div className="chat-bubble prose break-normal text-left">{json.globalRecommandation.slice(0, 200) + '...'}</div>
              <div className="chat-footer opacity-50">Analysis delivered</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;