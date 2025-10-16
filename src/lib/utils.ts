import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
    window.location.hash = `#${id}`;
  }
};

export const responseJson = (message: any, status: number = 200) => {
  return new Response(JSON.stringify(JSON.stringify(message)), {
    status: status,
    headers: { "Content-Type": "application/json" },
  })
}