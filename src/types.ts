import React from 'react';

export type AppId = string;

export interface AppConfig {
  id: string;
  name: string;
  url: string;
  faviconUrl?: string;
  description: string;
  color: string;
  pinned?: boolean;
  category: 'tools' | 'productivity' | 'health' | 'finance' | 'other';
}
