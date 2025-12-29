
import { Instance, Bucket, RDSDatabase, LambdaFunction, VPCNetwork } from './types';

export const INITIAL_INSTANCES: Instance[] = [
  { id: 'i-0a1b2c3d4e5f6g7h8', name: 'web-server-prod', state: 'running', type: 't3.micro', az: 'us-east-1a', publicIp: '54.123.45.67' },
  { id: 'i-1a2b3c4d5e6f7g8h9', name: 'worker-node-01', state: 'stopped', type: 'm5.large', az: 'us-east-1b', publicIp: '-' },
];

export const INITIAL_BUCKETS: Bucket[] = [
  { name: 'streamX-assets-prod', region: 'us-east-1', access: 'Public', created: '2023-01-15' },
  { name: 'backup-logs-2024', region: 'us-west-2', access: 'Private', created: '2024-03-10' },
];

export const INITIAL_DATABASES: RDSDatabase[] = [
  { id: 'db-primary', name: 'prod-main-db', engine: 'PostgreSQL', status: 'available', size: 'db.t3.medium', endpoint: 'prod-main.cx92.global.streamx.com', az: 'global-1a' },
  { id: 'db-replica', name: 'staging-db', engine: 'MySQL', status: 'available', size: 'db.t3.micro', endpoint: 'staging.cx92.global.streamx.com', az: 'global-1b' }
];

export const INITIAL_LAMBDA_FUNCTIONS: LambdaFunction[] = [
  { name: 'image-processor-v2', runtime: 'Node.js 20.x', description: 'Processes uploaded images from S3', lastModified: '2024-02-12', memory: 512 },
  { name: 'auth-validator', runtime: 'Python 3.11', description: 'Validates JWT tokens for API Gateway', lastModified: '2024-03-01', memory: 128 },
  { name: 'daily-report-gen', runtime: 'Node.js 18.x', description: 'Generates PDF reports every midnight', lastModified: '2024-01-20', memory: 1024 }
];

export const INITIAL_VPCS: VPCNetwork[] = [
  { id: 'vpc-0123456789abcdef0', name: 'default-vpc', cidr: '172.31.0.0/16', state: 'available', tenancy: 'default' },
  { id: 'vpc-0987654321fedcba1', name: 'prod-secure-vpc', cidr: '10.0.0.0/16', state: 'available', tenancy: 'default' }
];

export const COST_DATA = [
  { name: 'Jan', cost: 1200 },
  { name: 'Feb', cost: 1350 },
  { name: 'Mar', cost: 1100 },
  { name: 'Apr', cost: 1600 },
  { name: 'May', cost: 2100 },
  { name: 'Jun', cost: 1950 },
];
