import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    }, 
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'static2.finnhub.io',
                port: '',
                pathname: '/file/publicdatany/finnhubimage/**',
            },
            {
                protocol: 'https',
                hostname: 'static.finnhub.io',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'finnhub.io',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;