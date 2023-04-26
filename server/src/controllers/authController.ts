import { Account } from "../constants";
import client from "../config/sgid";
import { prisma } from "../config/database";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

type User = {
  id: number;
  displayName: string;
  authCategory?: number;
  accountType: number;
  approved: boolean;
};

const AUTHORISE = true;

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRY = "1h";
const DEV_PORT = "5173";

const generateUrl = async (req: Request, res: Response) => {
  const clientUrl = formURL(req);
  const login = client.authorizationUrl(
    "login",
    "openid",
    null,
    clientUrl.toString()
  ).url;

  const checkin = client.authorizationUrl(
    "checkin",
    "openid",
    null,
    clientUrl.toString()
  ).url;

  res.status(200).json({ login, checkin });
};

const login = async (req: Request, res: Response) => {
  const { code } = req.params;
  const clientUrl = formURL(req);

  try {
    const { sub: openId } = await client.callback(
      code as string,
      null,
      clientUrl.toString()
    );
    try {
      const userData = await prisma.user.findUniqueOrThrow({
        where: { openId } as any,
        select: {
          id: true,
          displayName: true,
          authCategory: true,
          accountType: true,
          approved: true,
          trainee: {
            select: {
              id: true,
            },
          },
        },
      });
      if (userData.approved) {
        const token = await jwt.sign(userData, JWT_SECRET, {
          expiresIn: JWT_EXPIRY,
        });
        res.status(200).json({ token });
      } else {
        res.status(400).json({
          alert: "Your requested account has not been approved",
        });
      }
    } catch (error: any) {
      const prismaError = error as PrismaClientKnownRequestError;
      if (prismaError.code === "P2025") {
        res.status(404).json(openId);
      } else {
        res.status(500);
      }
    }
  } catch (error) {
    //SG ID client unavailable
    console.log(error);
    res.status(500);
  }
};

const findUser = async (req: Request, res: Response) => {
  const { openId } = req.params;

  const userData = await prisma.user.findUniqueOrThrow({
    where: { openId } as any,
    select: {
      id: true,
      displayName: true,
      authCategory: true,
      accountType: true,
    },
  });

  const token = await jwt.sign(userData, JWT_SECRET, { expiresIn: "1h" });
  res.json(token);
};

const isAuth =
  (authorized: number[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    if (!AUTHORISE) {
      return next();
    }

    try {
      const authorization = req.headers.authorization;
      const token = authorization?.split(" ")[1].toString();
      const id = Number(req.params.id);
      const trainingId = Number(req.params.trainingId);

      if (!token) {
        console.log("check token failed", token);
        return res
          .status(401)
          .json({ message: "Missing or invalid authorization token" });
      }

      const verifiedUser = jwt.verify(
        token as string,
        process.env.JWT_SECRET as string
      ) as User;
      console.log("verified user", verifiedUser);

      if (!authorized.includes(verifiedUser.accountType)) {
        throw new Error("You are unauthorized");
      }
      if (verifiedUser.accountType === Account.TraineeAdmin) {
        if (id) {
          const trainee = await prisma.trainee.findUnique({
            where: { id },
            select: { category: true },
          });

          const training = await prisma.training.findUnique({
            where: { id },
            select: { requirement: true },
          });

          if (trainee && verifiedUser.authCategory === trainee?.category) {
            console.log("Authorized category");
            return next();
          } else if (training) {
            return next();
          }
        } else {
          return next();
        }
      } else if (verifiedUser.accountType === Account.Trainee) {
        console.log("verified trainee", verifiedUser);
        if (id) {
          const trainee = await prisma.trainee.findUnique({
            where: { id },
            select: { user: true },
          });

          if (trainee?.user === verifiedUser.id) {
            return next();
          } else {
            throw new Error("You are unauthorized to access this");
          }
        }
      } else if (verifiedUser.accountType === Account.Trainer) {
        console.log("verifying trainer", verifiedUser);
        if (Number(trainingId)) {
          const training = await prisma.training.findUnique({
            where: { id: trainingId },
            select: { requirement: true },
          });

          const trainingsProvided = await prisma.trainingProvided.findMany({
            where: { requirement: training?.requirement },
            select: { user: true },
          });

          for (const training of trainingsProvided) {
            if (training.user === verifiedUser.id) {
              res.status(200).json({
                message: "You are authorized to book training for trainees",
              });
              return next();
            }
          }
        } else {
          console.log("checked");
          return next();
        }
      } else if (verifiedUser.accountType === Account.Admin) {
        return next();
      }
      throw new Error("You are unauthorized");
    } catch (err) {
      console.log("catch error", err);
      res.status(404).json({ err });
    }
  };

export { generateUrl, isAuth, login, findUser };

const formURL = (req: Request) => {
  const newURL = new URL("https://example.com");
  newURL.hostname = req.hostname;
  if (newURL.hostname === "localhost") {
    newURL.port = DEV_PORT;
    newURL.protocol = "http";
  } else {
    newURL.protocol = "https";
  }
  return newURL;
};
