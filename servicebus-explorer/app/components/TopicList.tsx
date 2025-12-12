'use client';

import { useState, useEffect } from 'react';

interface Topic {
  name: string;
  status: string;
  subscriptionCount: number;
}

interface Subscription {
  name: string;
  messageCount: number;
  activeMessageCount: number;
  deadLetterMessageCount: number;
  status: string;
}

interface TopicListProps {
  selectedTopic: string | null;
  selectedSubscription: string | null;
  onSelectTopic: (topicName: string) => void;
  onSelectSubscription: (subscriptionName: string) => void;
}

export default function TopicList({ 
  selectedTopic, 
  selectedSubscription,
  onSelectTopic, 
  onSelectSubscription 
}: TopicListProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTopicName, setNewTopicName] = useState('');
  const [newSubscriptionName, setNewSubscriptionName] = useState('');
  const [showCreateTopicForm, setShowCreateTopicForm] = useState(false);
  const [showCreateSubForm, setShowCreateSubForm] = useState(false);

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      const data = await res.json();
      
      // Check if data is an array, otherwise set empty array
      if (Array.isArray(data)) {
        setTopics(data);
      } else {
        setTopics([]);
        console.error('Invalid data format:', data);
      }
    } catch (error) {
      setTopics([]);
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async (topicName: string) => {
    try {
      const res = await fetch(`/api/subscriptions?topic=${topicName}`);
      const data = await res.json();
      
      // Check if data is an array, otherwise set empty array
      if (Array.isArray(data)) {
        setSubscriptions(data);
      } else {
        setSubscriptions([]);
        console.error('Invalid data format:', data);
      }
    } catch (error) {
      setSubscriptions([]);
      console.error('Error fetching subscriptions:', error);
    }
  };

  useEffect(() => {
    fetchTopics();
    const interval = setInterval(fetchTopics, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      fetchSubscriptions(selectedTopic);
      const interval = setInterval(() => fetchSubscriptions(selectedTopic), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTopic]);

  const createTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName: newTopicName }),
      });
      
      if (res.ok) {
        setNewTopicName('');
        setShowCreateTopicForm(false);
        fetchTopics();
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const createSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topicName: selectedTopic, 
          subscriptionName: newSubscriptionName 
        }),
      });
      
      if (res.ok) {
        setNewSubscriptionName('');
        setShowCreateSubForm(false);
        fetchSubscriptions(selectedTopic);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const deleteTopic = async (topicName: string) => {
    if (!confirm(`Delete topic "${topicName}"?`)) return;
    
    try {
      await fetch(`/api/topics?name=${topicName}`, { method: 'DELETE' });
      fetchTopics();
      if (selectedTopic === topicName) {
        onSelectTopic('');
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const deleteSubscription = async (subscriptionName: string) => {
    if (!selectedTopic || !confirm(`Delete subscription "${subscriptionName}"?`)) return;
    
    try {
      await fetch(`/api/subscriptions?topic=${selectedTopic}&name=${subscriptionName}`, { 
        method: 'DELETE' 
      });
      fetchSubscriptions(selectedTopic);
      if (selectedSubscription === subscriptionName) {
        onSelectSubscription('');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading topics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-purple-600 to-purple-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            Topics
          </h2>
          <button
            onClick={() => setShowCreateTopicForm(!showCreateTopicForm)}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 text-sm font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
          >
            + New Topic
          </button>
        </div>

        {showCreateTopicForm && (
          <form onSubmit={createTopic} className="p-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Enter topic name..."
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg mb-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 text-sm font-semibold shadow-md transition-all"
              >
                ✓ Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateTopicForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold transition-all"
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
          {topics.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 rounded-full p-4 inline-block mb-3">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">No topics found</p>
              <p className="text-gray-400 text-sm">Create a topic to get started</p>
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.name}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                  selectedTopic === topic.name ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600' : 'border-l-4 border-transparent'
                }`}
                onClick={() => onSelectTopic(topic.name)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                      💬 {topic.name}
                    </h3>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      📌 {topic.subscriptionCount} Subscriptions
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTopic(topic.name);
                    }}
                    className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-all"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTopic && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-green-600 to-green-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Subscriptions
            </h2>
            <button
              onClick={() => setShowCreateSubForm(!showCreateSubForm)}
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 text-sm font-semibold shadow-md transition-all duration-200 transform hover:scale-105"
            >
              + New Subscription
            </button>
          </div>

          {showCreateSubForm && (
            <form onSubmit={createSubscription} className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-teal-50">
              <input
                type="text"
                value={newSubscriptionName}
                onChange={(e) => setNewSubscriptionName(e.target.value)}
                placeholder="Enter subscription name..."
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg mb-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 text-sm font-semibold shadow-md transition-all"
                >
                  ✓ Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSubForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold transition-all"
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center">
                <div className="bg-gray-100 rounded-full p-4 inline-block mb-3">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">No subscriptions found</p>
                <p className="text-gray-400 text-sm">Create a subscription to receive messages</p>
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.name}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                    selectedSubscription === sub.name ? 'bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-600' : 'border-l-4 border-transparent'
                  }`}
                  onClick={() => onSelectSubscription(sub.name)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        📥 {sub.name}
                      </h3>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                          ✓ {sub.activeMessageCount} Active
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                          📊 {sub.messageCount} Total
                        </span>
                        {sub.deadLetterMessageCount > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-semibold">
                            ⚠️ {sub.deadLetterMessageCount} DLQ
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSubscription(sub.name);
                      }}
                      className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-xs font-semibold transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
