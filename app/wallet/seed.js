/* global Promise */
import { seeder as seederFactory } from "../middleware/grpc/client";
import { GenerateRandomSeedRequest, DecodeSeedRequest } from "../middleware/walletrpc/api_pb";
import { createSelector } from "reselect";

export const SEED_WORDS = require("../helpers/wordlist.js");
SEED_WORDS.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

export const SEED_LENGTH = 33;

export const getSeedService = createSelector(
  [
    ({ grpc: { address } }) => address,
    ({ grpc: { port } }) => port
  ],
  (address, port) =>
    (new Promise((resolve, reject) =>
      seederFactory(
        { address, port },
        (response, err) => err ? reject(err) : resolve(response)
      )
    )).then(seeder => ({
      generate() {
        return new Promise((resolve, reject) => {
          try {
            const request = new GenerateRandomSeedRequest();
            seeder.generateRandomSeed(request, (err, response) => err ? reject(err) : resolve(response));
          } catch(err) {
            reject(err);
          }
        });
      },

      decode(mnemonic) {
        return new Promise((resolve, reject) => {
          try {
            const request = new DecodeSeedRequest();
            request.setUserInput(mnemonic);
            seeder.decodeSeed(request, (err, response) => err ? reject(err) : resolve(response));
          } catch(err) {
            reject(err);
          }
        });
      }
    }))
);
