import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";
import { describe, it, expect, beforeEach } from "vitest";
import { RegisterUseCase } from "./register";
import { compare } from "bcryptjs";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";

let usersRepository: InMemoryUsersRepository;
let sut: RegisterUseCase;

describe("Register Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new RegisterUseCase(usersRepository);
  });

  it("should be able to register", async () => {
    const { user } = await sut.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it("should hash user password upon registration", async () => {
    const { user } = await sut.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    const isPasswordCorrectlyHash = await compare("123456", user.password_hash);

    expect(isPasswordCorrectlyHash).toBe(true);
  });

  it("should not be able to register with same email twice", async () => {
    await sut.execute({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });

    expect(async () => {
      await sut.execute({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
