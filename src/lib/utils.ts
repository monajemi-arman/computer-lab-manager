import { IComputer, IComputerDocument as HydratedDocument } from "@/types/computer";
import { IUser } from "@/types/user";
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

export const waitFor = (
  conditionFn: () => boolean, 
  interval = 100,
  timeout = 20000
) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      if (conditionFn()) {
        clearInterval(timer);
        resolve(true);
      } else if (Date.now() - startTime >= timeout) {
        clearInterval(timer);
        reject(new Error(`waitFor timed out after ${timeout}ms`));
      }
    }, interval);
  });
}

export const responseJson = (message: unknown, status: number = 200) => {
  return new Response(JSON.stringify(isHydratedDocument(message) ? message.toObject() : message), {
    status: status,
    headers: { "Content-Type": "application/json" },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isHydratedDocument(obj: any): obj is HydratedDocument {
  return typeof obj?.toObject === "function" || typeof obj?.save === "function";
}

export const computerUsersToUsernames = (computer: IComputer | HydratedDocument) => {
  if (computer.users) {
    if (isHydratedDocument(computer)) {
      return {
        ...computer.toObject(),
        users: computer.toObject().users?.map((user: IUser) => user.username),
      }
    }
    else {
      return {
        ...computer,
        users: computer.users?.map((user: IUser) => user.username),
      }
    }
  }
  return computer;
}