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