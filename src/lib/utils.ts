import { IComputer, IComputerDocument as HydratedDocument } from "@/types/computer";
import { IUser, IUserDocument, IUserInput } from "@/types/user";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns';
import { Readable } from "stream";

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
  timeout = 10000
) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const timer = setInterval(() => {
      if (conditionFn()) {
        clearInterval(timer);
        resolve(true);
      } else if (Date.now() - startTime >= timeout) {
        clearInterval(timer);
        resolve(false);
      }
    }, interval);
  });
}

export const sanitizeUserOutput = (user: IUserInput | IUser | IUserDocument) => {
  const propertiesToRemove = ['password', 'privateKey', 'publicKey'] as const;

  const sanitized = { ...user };

  for (const prop of propertiesToRemove) {
    delete sanitized[prop];
  }

  return sanitized;
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

export const parseDate = (date: Date) => format(date, "yyyy-MM-dd HH:mm");

export function nodeToWebStream(nodeStream: Readable): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => controller.enqueue(chunk));
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    }
  });
}

export function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}