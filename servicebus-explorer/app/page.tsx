'use client';

import { useState, useEffect } from 'react';
import QueueList from './components/QueueList';
import TopicList from './components/TopicList';
import MessagePanel from './components/MessagePanel';

interface Stats {
  totalQueues: number;
  totalTopics: number;
  totalMessages: number;
  activeMessages: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'queues' | 'topics'>('queues');
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [stats, setStats] = useState<Stats>({
    totalQueues: 0,
    totalTopics: 0,
    totalMessages: 0,
    activeMessages: 0,
  });

  const fetchStats = async () => {
    try {
      const [queuesRes, topicsRes] = await Promise.all([
        fetch('/api/queues'),
        fetch('/api/topics'),
      ]);
      
      const queues = await queuesRes.json();
      const topics = await topicsRes.json();
      
      if (Array.isArray(queues) && Array.isArray(topics)) {
        const totalMessages = queues.reduce((sum, q) => sum + (q.messageCount || 0), 0);
        const activeMessages = queues.reduce((sum, q) => sum + (q.activeMessageCount || 0), 0);
        
        setStats({
          totalQueues: queues.length,
          totalTopics: topics.length,
          totalMessages,
          activeMessages,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Azure Service Bus Explorer
              </h1>
              <p className="text-sm text-blue-100 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Connected to Emulator
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-200 uppercase tracking-wide">Dashboard</p>
              <p className="text-sm font-medium">{currentTime || '--:--:--'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Queues</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalQueues}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Topics</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTopics}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Messages</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeMessages}</p>
              </div>
              <div className="bg-green-100 rounded-full p-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMessages}</p>
              </div>
              <div className="bg-orange-100 rounded-full p-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-2 bg-white rounded-xl shadow-md p-2">
            <button
              onClick={() => setActiveTab('queues')}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'queues'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Queues
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                activeTab === 'topics'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💬 Topics
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {activeTab === 'queues' ? (
              <QueueList 
                selectedQueue={selectedQueue} 
                onSelectQueue={setSelectedQueue} 
              />
            ) : (
              <TopicList
                selectedTopic={selectedTopic}
                selectedSubscription={selectedSubscription}
                onSelectTopic={setSelectedTopic}
                onSelectSubscription={setSelectedSubscription}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            {activeTab === 'queues' && selectedQueue && (
              <MessagePanel entityType="queue" entityName={selectedQueue} />
            )}
            {activeTab === 'topics' && selectedTopic && selectedSubscription && (
              <MessagePanel 
                entityType="subscription" 
                entityName={selectedTopic}
                subscriptionName={selectedSubscription}
              />
            )}
            {!selectedQueue && activeTab === 'queues' && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="bg-blue-100 rounded-full p-6 inline-block mb-4">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Queue</h3>
                <p className="text-gray-600">Choose a queue from the list to view and manage messages</p>
              </div>
            )}
            {!selectedTopic && activeTab === 'topics' && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="bg-purple-100 rounded-full p-6 inline-block mb-4">
                  <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Topic & Subscription</h3>
                <p className="text-gray-600">Choose a topic and subscription to view and manage messages</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
