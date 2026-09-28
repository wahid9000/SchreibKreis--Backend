import { Request, Response } from "express";
import { userService } from "./user.service";

const updateUser = async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.user!.id, req.body);

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    message: "User information updated successfully",
    data: user,
  });
};

export const userController = {
  updateUser,
};
