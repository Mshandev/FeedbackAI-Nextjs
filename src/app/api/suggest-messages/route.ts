import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started? || If you could have dinner with any historical figure, who would it be? || What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const model = openai("gpt-3.5-turbo-instruct", {
      echo: true,
      logitBias: {
        "50256": -100,
      },
    });

    const result = await streamText({
      model,
      prompt,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("An error occurred:", error); 

    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;

      if (status === 429 || error.message.includes("exceeded your current quota")) {
        return NextResponse.json(
          {
            success: false,
            message:
              "You have exceeded your quota. Please check your billing details or upgrade your plan.",
          },
          { status: 429 }
        );
      } else if (status === 402) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Payment required. Please check your billing details.",
          },
          { status: 402 }
        );
      }

      return NextResponse.json(
        {
          name,
          status,
          headers,
          message,
        },
        { status }
      );
    } else {
      console.error("An unexpected error occurred", error);
      return NextResponse.json(
        {
          success: false,
          message: "Internal Server Error",
        },
        { status: 500 }
      );
    }
  }
}
