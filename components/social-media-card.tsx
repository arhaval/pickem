"use client";

import { Twitter, Youtube, Instagram, Twitch } from "lucide-react";
import Link from "next/link";

export default function SocialMediaCard() {
  const socialLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      url: "#",
      color: "text-blue-400",
      hoverColor: "hover:text-blue-300",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "#",
      color: "text-red-500",
      hoverColor: "hover:text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "#",
      color: "text-pink-500",
      hoverColor: "hover:text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
    },
    {
      name: "Twitch",
      icon: Twitch,
      url: "#",
      color: "text-purple-500",
      hoverColor: "hover:text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <Link
            key={social.name}
            href={social.url}
            className={`group relative flex items-center gap-2 rounded-lg border ${social.borderColor} ${social.bgColor} px-3 py-2 transition-all duration-200 ${social.hoverColor} hover:border-opacity-50 hover:shadow-md overflow-hidden`}
          >
            <Icon className={`h-4 w-4 ${social.color} transition-all`} />
            <span className="text-xs font-semibold text-white">{social.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
