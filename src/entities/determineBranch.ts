import { BinTrieFlags } from './BinTrieFlags'

/**
 * Determines the branch of the current node that is taken given the current
 * character. This function is used to traverse the trie.
 *
 * @param decodeTree The trie.
 * @param current The current node.
 * @param nodeIdx The index right after the current node and its value.
 * @param char The current character.
 * @returns The index of the next node, or -1 if no branch is taken.
 */
export function determineBranch(
  decodeTree: Uint16Array,
  current: number,
  nodeIndex: number,
  char: number,
): number {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;

  // Case 1: Single branch encoded in jump offset
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIndex : -1;
  }

  // Case 2: Multiple branches encoded in jump table
  if (jumpOffset) {
    const value = char - jumpOffset;

    return value < 0 || value >= branchCount
      ? -1
      : decodeTree[nodeIndex + value] - 1;
  }

  // Case 3: Multiple branches encoded in dictionary

  // Binary search for the character.
  let lo = nodeIndex;
  let hi = lo + branchCount - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const midValue = decodeTree[mid];

    if (midValue < char) {
      lo = mid + 1;
    } else if (midValue > char) {
      hi = mid - 1;
    } else {
      return decodeTree[mid + branchCount];
    }
  }

  return -1;
}
