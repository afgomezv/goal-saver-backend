import jwt from "jsonwebtoken";

export const generateJWT = (id: string) => {
  const token = jwt.sign({ id }, process.env.JWT_TOKEN, {
    expiresIn: "4h",
  });

  return token;
};

export const verifyJWT = (token: string) => {
  const decoded = jwt.verify(token, process.env.JWT_TOKEN);

  return decoded;
};
