'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Trophy, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface League {
  id: number;
  name: string;
  localizedName: string;
  logo: string;
}

interface ApiResponse {
  status: string;
  response: {
    popular: League[];
  };
}

interface FetchState {
  data: League[] | null;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const useFootballLeagues = () => {
  const [state, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
    lastFetch: null,
  });

  const fetchLeagues = useCallback(async (force = false) => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (!force && state.data && state.lastFetch && (now - state.lastFetch) < fiveMinutes) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_URL!, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.NEXT_PUBLIC_API_KEY!,
          'x-rapidapi-host': process.env.NEXT_PUBLIC_API_HOST!
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      setState({
        data: data.response.popular,
        loading: false,
        error: null,
        lastFetch: now,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leagues';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        lastFetch: null,
      });
    }
  }, [state.data, state.lastFetch]);

  const refetch = useCallback(() => {
    fetchLeagues(true);
  }, [fetchLeagues]);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch,
  };
};

const LeagueCardSkeleton = () => (
  <Card className="h-32 hover:shadow-lg transition-shadow duration-300">
    <CardContent className="flex items-center gap-4 p-4 h-full">
      <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </CardContent>
  </Card>
);

const LeagueCard = ({ league }: { league: League }) => (
  <Card className="h-32 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
    <CardContent className="flex items-center gap-4 p-4 h-full">
      <div className="relative flex-shrink-0">
        <img
          src={league.logo}
          alt={`${league.name} logo`}
          className="h-16 w-16 object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" fill="#f1f5f9"/>
                <text x="32" y="38" font-family="Arial" font-size="32" text-anchor="middle" fill="#64748b">⚽</text>
              </svg>
            `)}`;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {league.localizedName}
        </h3>
        <p className="text-sm text-gray-600 truncate">{league.name}</p>
        <Badge variant="secondary" className="mt-1 text-xs">
          ID: {league.id}
        </Badge>
      </div>
    </CardContent>
  </Card>
);

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-red-600">Offline</span>
        </>
      )}
    </div>
  );
};

const FootballLeagues = () => {
  const { data: leagues, loading, error, refetch } = useFootballLeagues();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6 text-center">
            <CardContent>
              <div className="text-red-500 mb-4">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <h2 className="text-xl font-semibold">Failed to load leagues</h2>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
              </div>
              <button 
                onClick={handleRefresh}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src={'/fl.png'} width={50} height={50} className='rounded-xl' alt='football league'/>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Football Leagues</h1>
                <p className="text-sm text-gray-600">Popular leagues worldwide</p>
              </div>
            </div>
            <NetworkStatus />
          </div>
        </div>
      </header>

     
      <main className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Popular Leagues</h2>
              <p className="text-gray-600">
                {loading ? 'Loading...' : `${leagues?.length || 0} leagues found`}
              </p>
            </div>
            {!loading && leagues && (
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <LeagueCardSkeleton key={i} />)
            : leagues?.map((league) => (
                <LeagueCard key={league.id} league={league} />
              ))
          }
        </div>

        {/* Empty state */}
        {!loading && (!leagues || leagues.length === 0) && (
          <Card className="p-8 text-center">
            <CardContent>
              <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No leagues found</h3>
              <p className="text-gray-500">Try refreshing the page or check back later.</p>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">Live API Data</h4>
                <p className="text-sm text-green-700">
                  Fetching real-time data from RapidAPI's free football data service. Data updates automatically with caching for optimal performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

     
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Football Leagues PWA
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Live Data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


const App = () => {
  return (
    <div className="font-sans">
      <FootballLeagues />
    </div>
  );
};

export default App;