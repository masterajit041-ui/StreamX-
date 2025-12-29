
export enum ServiceType {
  DASHBOARD = 'DASHBOARD',
  EC2 = 'EC2',
  S3 = 'S3',
  RDS = 'RDS',
  LAMBDA = 'LAMBDA',
  IAM = 'IAM',
  BILLING = 'BILLING',
  SUPPORT = 'SUPPORT',
  VPC = 'VPC',
  VIDEO_STREAMING = 'VIDEO_STREAMING',
  CDN = 'CDN',
  API_GATEWAY = 'API_GATEWAY',
  SECURITY_HUB = 'SECURITY_HUB',
  WAF = 'WAF',
  CLOUDWATCH_LOGS = 'CLOUDWATCH_LOGS',
  DYNAMODB = 'DYNAMODB',
  TRANSCODER = 'TRANSCODER',
  AI_PERSONALIZATION = 'AI_PERSONALIZATION',
  REALTIME_CHAT = 'REALTIME_CHAT'
}

export type UserRole = 'admin' | 'user';

export interface UserSession {
  username: string;
  email: string;
  role: UserRole;
  accountId: string;
  permissions?: string[]; 
}

export interface Instance {
  id: string;
  name: string;
  state: 'running' | 'stopped' | 'terminated' | 'pending';
  type: string;
  az: string;
  publicIp: string;
  tags?: Record<string, string>;
  createdAt?: string;
  firmwareLevel?: 'Standard' | 'Shielded' | 'Nitro';
}

export interface Bucket {
  name: string;
  region: string;
  access: 'Private' | 'Public';
  created: string;
}

export interface RDSDatabase {
  id: string;
  name: string;
  engine: 'MySQL' | 'PostgreSQL' | 'MariaDB' | 'Aurora';
  status: 'available' | 'creating' | 'modifying' | 'stopped';
  size: string;
  endpoint: string;
  az: string;
  createdAt?: string;
}

export interface LambdaFunction {
  name: string;
  runtime: string;
  description: string;
  lastModified: string;
  memory: number;
}

export interface VPCNetwork {
  id: string;
  name: string;
  cidr: string;
  state: 'available' | 'pending';
  tenancy: 'default' | 'dedicated';
  createdAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
