import { sum } from "lodash";
import { Vote } from "../types";

export function getWeight(vote: Vote): number {
    const SCALE = 0.01;
    const SHIFT = 0.95;
    const tdelta = Date.now() / 1000 - vote.timestamp;
    return Math.min(1, 1 / (SCALE * (1 / 3600) * tdelta + SHIFT));
}

export function getChanceWorking(votes: Vote[]): [number, number] | null {
    if (votes.length === 0) {
        return null;
    }
    const weights = votes.map(getWeight);
    const weightsWorking = votes.filter((v) => v.working).map(getWeight);
    const weightsNotWorking = votes.filter((v) => !v.working).map(getWeight);

    return [
        sum(weightsWorking) / sum(weights),
        sum(weightsNotWorking) / sum(weights),
    ];
}

export function getFlagNumbers(votes: Vote[]): { [key: string]: number } {
    const resultRaw: { [key: string]: number } = {};
    votes.forEach((v) => {
        for (const flag of v.flags) {
            resultRaw[flag] = (resultRaw[flag] ?? 0) + 1;
        }
    });
    const result: { [key: string]: number } = {};
    Object.keys(resultRaw).forEach(
        (v) => (result[v] = resultRaw[v] / votes.length)
    );
    return result;
}
