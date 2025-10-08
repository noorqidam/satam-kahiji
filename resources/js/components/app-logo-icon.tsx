import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img {...props} src="/logo-satam.png" alt="Satam Kahiji Logo" className={`object-contain ${props.className || ''}`} />;
}
