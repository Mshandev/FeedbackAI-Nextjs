import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import MessageModel, { Message } from "@/model/Message";

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found ",
        },
        { status: 404 }
      );
    }
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not accepting message at this time",
        },
        { status: 403 }
      );
    }
    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Message Send Successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error in sending message", error);
    return Response.json(
      {
        success: false,
        message: "Error in sending message",
      },
      { status: 500 }
    );
  }
}
