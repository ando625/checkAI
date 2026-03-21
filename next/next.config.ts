import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                // laravelではなく nginx(80番ポート) 経由で転送
                destination: 'http://nginx/api/:path*',
            },
        ];
    },
};

export default nextConfig;
