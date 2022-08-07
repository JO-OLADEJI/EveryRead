import bcrypt from "bcryptjs";

export const hash = async (value: string): Promise<string> => {
  const salt: string = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(value, salt);
  return hashed;
};

export const compareHash = async (
  value: string,
  hash: string
): Promise<boolean> => {
  const match = await bcrypt.compare(value, hash);
  return match;
};
