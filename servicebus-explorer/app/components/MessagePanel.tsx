'use client';

import { useState, useEffect } from 'react';

interface Message {
  messageId: string;
  body: any;
  properties: any;
  enqueuedTimeUtc: string;
  sequenceNumber: string;
  deliveryCount: number;
}

interface MessagePanelProps {
  entityType: 'queue' | 'subscription';
  entityName: string;
  subscriptionName?: string;
}

export default function MessagePanel({ entityType, entityName, subscriptionName }: MessagePanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showSendForm, setShowSendForm] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [messageProperties, setMessageProperties] = useState('{}');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        entityType,
        entityName,
        ...(subscriptionName && { subscriptionName }),
      });
      
      const res = await fetch(`/api/messages?${params}`);
      const data = await res.json();
      
      // Check if data is an array, otherwise set empty array
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
        console.error('Invalid data format:', data);
      }
    } catch (error) {
      setMessages([]);
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [entityType, entityName, subscriptionName]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let properties = {};
      try {
        properties = JSON.parse(messageProperties);
      } catch (err) {
        alert('Invalid JSON in properties');
        return;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityName,
          subscriptionName,
          message: messageBody,
          properties,
        }),
      });

      if (res.ok) {
        setMessageBody('');
        setMessageProperties('{}');
        setShowSendForm(false);
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const purgeMessages = async () => {
    if (!confirm('Delete all messages?')) return;

    try {
      const params = new URLSearchParams({
        entityType,
        entityName,
        purgeAll: 'true',
        ...(subscriptionName && { subscriptionName }),
      });

      const res = await fetch(`/api/messages?${params}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error purging messages:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Messages
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-white bg-white/20 rounded-lg px-3 py-2 mb-3">
          <span className="font-semibold">📍 {entityName}</span>
          {subscriptionName && <span className="font-semibold">/ 📥 {subscriptionName}</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSendForm(!showSendForm)}
            className="flex-1 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-semibold shadow-md transition-all transform hover:scale-105"
          >
            📤 Send Message
          </button>
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-md transition-all"
          >
            🔄 Refresh
          </button>
          <button
            onClick={purgeMessages}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold shadow-md transition-all"
          >
            🗑️ Purge All
          </button>
        </div>

        {showSendForm && (
          <form onSubmit={sendMessage} className="mt-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>📝</span> Message Body
              </label>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                rows={4}
                placeholder="Enter your message content..."
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span>⚙️</span> Properties (JSON)
              </label>
              <textarea
                value={messageProperties}
                onChange={(e) => setMessageProperties(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                rows={3}
                placeholder='{"key": "value"}'
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-md transition-all"
              >
                ✓ Send Message
              </button>
              <button
                type="button"
                onClick={() => setShowSendForm(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all"
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 p-6">
        <div className="border-r border-gray-200 pr-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Messages List
            </h3>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold">
              {messages.length} total
            </span>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-6 inline-block mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No messages</p>
              <p className="text-gray-400 text-sm">Send a message to see it here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {messages.map((msg) => (
                <div
                  key={msg.messageId}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedMessage?.messageId === msg.messageId
                      ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md transform scale-105'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 rounded-full p-2 mt-1">
                      <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-gray-500 truncate mb-1">
                        ID: {msg.messageId}
                      </div>
                      <div className="text-sm text-gray-800 font-medium truncate mb-2">
                        {typeof msg.body === 'string' ? msg.body : JSON.stringify(msg.body)}
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          🔁 {msg.deliveryCount}x
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Message Details
          </h3>
          {selectedMessage ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <label className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 block">📋 Message ID</label>
                <div className="text-sm font-mono bg-white p-3 rounded border border-blue-200 break-all">
                  {selectedMessage.messageId}
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                <label className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2 block">📝 Body</label>
                <pre className="text-sm bg-white p-3 rounded overflow-x-auto border border-green-200">
                  {typeof selectedMessage.body === 'string'
                    ? selectedMessage.body
                    : JSON.stringify(selectedMessage.body, null, 2)}
                </pre>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <label className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2 block">⚙️ Properties</label>
                <pre className="text-sm bg-white p-3 rounded overflow-x-auto border border-purple-200">
                  {JSON.stringify(selectedMessage.properties, null, 2)}
                </pre>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                <label className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-2 block">🕐 Enqueued Time</label>
                <div className="text-sm bg-white p-3 rounded border border-orange-200 font-medium">
                  {new Date(selectedMessage.enqueuedTimeUtc).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                  <label className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2 block">🔢 Sequence</label>
                  <div className="text-sm bg-white p-3 rounded border border-indigo-200 font-mono">
                    {selectedMessage.sequenceNumber}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                  <label className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2 block">🔁 Delivery Count</label>
                  <div className="text-sm bg-white p-3 rounded border border-red-200 font-bold text-center text-lg">
                    {selectedMessage.deliveryCount}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-8 inline-block mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Select a message</p>
              <p className="text-gray-400 text-sm mt-1">Click on a message to view its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
