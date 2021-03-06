import { User, IUserDocument } from "./data/User";
import passport from "passport";
import { jsonAPI, validate } from "./json"
import {
  ApiUser,
  RegisterRequestType, RegisterRequest,
  UserUpdateRequestType, UserUpdateRequest,
} from "../common/types"

export default {
  getUser: jsonAPI<ApiUser | undefined>(async req => {
    const user = req.user;
    if (user) {
      return {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    }
  }),

  postUser: jsonAPI<void>(async req => {
    const userUpdate = validate<UserUpdateRequest>(UserUpdateRequestType, req.body)
    const {_id, name} = req.user
    console.log(`Updating user ${_id}:`, userUpdate);
    await User.findOneAndUpdate({_id}, userUpdate).exec()
  }),

  registerUser: jsonAPI<any>(async req => {
    const user = validate<RegisterRequest>(RegisterRequestType, req.body)
    console.log(`Registering user: ${user.email}`);

    const registeredUser = await User.registerUser(user);

    if (!registeredUser) {
      throw new Error("Couldn't create user")
    }

    console.log(`Logging in user: ${registeredUser.email}`);

    const promise = new Promise((resolve, reject) => {
      req.login(registeredUser, loginError => {
        if (loginError) {
          console.log(`Login error ${loginError}`);
          reject("Couldn't log in");
        } else {
          resolve({ status: "OK" });
        }
      })
    });

    return promise;

  }),

  loginUser: async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).send("Authentication error")
      } else if (!user) {
        return res.status(401).send(info.message)
      } else {
        req.login(user, loginError => {
          if (loginError) return next(loginError)
          return res.redirect("/")
        })
      }
    })(req, res, next)
  },

  loginFacebook: passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),

  logout: (req, res) => {
    req.logout()
    res.redirect("/login")
  },
}
