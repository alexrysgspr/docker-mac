"use client";

import { useState, useEffect } from "react";

interface Queue {
  name: string;
  messageCount: number;
  activeMessageCount: number;
  deadLetterMessageCount: number;
  status: string;
}

interface QueueListProps {
  selectedQueue: string | null;
  onSelectQueue: (queueName: string) => void;
}

export default function QueueList({
  selectedQueue,
  onSelectQueue,
}: QueueListProps) {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQueueName, setNewQueueName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchQueues = async () => {
    try {
      const res = await fetch("/api/queues");
      const data = await res.json();
      
      // Check if data is an array, otherwise set empty array
      if (Array.isArray(data)) {
        setQueues(data);
      } else {
        setQueues([]);
        console.error("Invalid data format:", data);
      }
    } catch (error) {
      setQueues([]);
      console.error("Error fetching queues:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 5000);
    return () => clearInterval(interval);
  }, []);

  const createQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueName: newQueueName }),
      });

      if (res.ok) {
        setNewQueueName("");
        setShowCreateForm(false);
        fetchQueues();
      }
    } catch (error) {
      console.error("Error creating queue:", error);
    }
  };

  const deleteQueue = async (queueName: string) => {
    if (!confirm(`Delete queue "${queueName}"?`)) return;

    try {
      await fetch(`/api/queues?name=${queueName}`, { method: "DELETE" });
      fetchQueues();
      if (selectedQueue === queueName) {
        onSelectQueue("");
      }
    } catch (error) {
      console.error("Error deleting queue:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading queues...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Queues
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
        >
          + New Queue
        </button>
      </div>

      {showCreateForm && (
        <form
          onSubmit={createQueue}
          className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <input
            type="text"
            value={newQueueName}
            onChange={(e) => setNewQueueName(e.target.value)}
            placeholder="Enter queue name..."
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg mb-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 text-sm font-semibold shadow-md transition-all"
            >
              ✓ Create
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold transition-all"
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {queues.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-100 rounded-full p-6 inline-block mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No queues found</p>
            <p className="text-gray-400 text-sm mt-1">Create your first queue to get started</p>
          </div>
        ) : (
          queues.map((queue) => (
            <div
              key={queue.name}
              className={`p-5 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                selectedQueue === queue.name
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600"
                  : "border-l-4 border-transparent"
              }`}
              onClick={() => onSelectQueue(queue.name)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    📋 {queue.name}
                  </h3>
                  <div className="flex gap-3 text-sm">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                      ✓ {queue.activeMessageCount} Active
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                      📊 {queue.messageCount} Total
                    </span>
                    {queue.deadLetterMessageCount > 0 && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-semibold">
                        ⚠️ {queue.deadLetterMessageCount} DLQ
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteQueue(queue.name);
                  }}
                  className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-sm font-semibold transition-all"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
