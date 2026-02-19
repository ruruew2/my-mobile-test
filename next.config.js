/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
    remotePatterns: [
    {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // pathname 뒤의 '/**'는 cloudinary 내의 모든 경로를 허용한다는 뜻입니다.
        pathname: '/**', 
    },
    ],
},
};

module.exports = nextConfig;