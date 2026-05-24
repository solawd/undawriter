"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

interface ClaimMessage {
  id: number;
  claimId: number;
  userId: number;
  userFullName: string;
  userProfile: string;
  parentId: number | null;
  message: string;
  createdAt: string;
}

export default function ClaimMessages({ claimId, apiBaseUrl }: { claimId: number, apiBaseUrl: string }) {
  const [messages, setMessages] = useState<ClaimMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");

  const fetchMessages = () => {
    fetchWithAuth(`${apiBaseUrl}/${claimId}/messages`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch messages", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, [claimId, apiBaseUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    fetchWithAuth(`${apiBaseUrl}/${claimId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        message: newMessage,
        parentId: replyingTo
      })
    })
    .then(res => res.json())
    .then(data => {
      setMessages([...messages, data]);
      setNewMessage("");
      setReplyingTo(null);
    })
    .catch(err => console.error("Failed to post message", err));
  };

  const renderMessage = (msg: ClaimMessage, depth = 0) => {
    const isStaff = msg.userProfile === 'STAFF' || msg.userProfile === 'ADMIN';
    const children = messages.filter(m => m.parentId === msg.id);
    
    return (
      <div key={msg.id} style={{ marginLeft: `${depth * 2}rem` }} className="mb-4">
        <div className={`p-4 rounded-xl border ${isStaff ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-bold text-gray-800">{msg.userFullName}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${isStaff ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                {isStaff ? 'Staff' : 'Customer'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(msg.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{msg.message}</p>
          
          <div className="mt-3 flex justify-end">
            <button 
              onClick={() => setReplyingTo(msg.id)}
              className="text-sm text-secondary hover:underline font-semibold"
            >
              Reply
            </button>
          </div>
        </div>

        {replyingTo === msg.id && (
          <div className="mt-3 ml-8">
             <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                <textarea 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  rows={3}
                  placeholder={`Replying to ${msg.userFullName}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  required
                />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => {setReplyingTo(null); setNewMessage("");}} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-opacity-90">Post Reply</button>
                </div>
             </form>
          </div>
        )}

        <div className="mt-4">
          {children.map(child => renderMessage(child, depth + 1))}
        </div>
      </div>
    );
  };

  const topLevelMessages = messages.filter(m => m.parentId === null);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Claim Discussion</h2>
      
      {loading ? (
        <div className="text-center text-gray-500 py-4">Loading messages...</div>
      ) : (
        <div className="mb-8">
          {topLevelMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8 italic border border-dashed rounded-xl">No messages yet. Start the conversation below.</div>
          ) : (
            topLevelMessages.map(msg => renderMessage(msg))
          )}
        </div>
      )}

      {replyingTo === null && (
        <div className="mt-6 border-t pt-6">
          <h3 className="font-semibold text-gray-700 mb-3">Add a Message</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea 
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
              rows={4}
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2.5 bg-secondary text-white font-bold rounded-lg hover:bg-opacity-90 shadow-sm">
                Post Message
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
