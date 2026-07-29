import { gql } from './api.ts'

export interface ReviewInfo {
  id: string
  number: number
  status: 'OPEN' | 'LANDING' | 'LANDED' | 'LAND_FAILED' | 'ABANDONED'
  landed_node: string | null
  land_error: string | null
  latest_version: { head_node: string } | null
}

const REVIEW_FIELDS = `id number status landed_node land_error latest_version { head_node }`

export async function getReview(owner: string, repo: string, number: number): Promise<ReviewInfo | null> {
  const data = await gql<{ repository_by_owner_and_name: { review: ReviewInfo | null } | null }>(
    `query($owner: String!, $repo: String!, $number: Int!) {
      repository_by_owner_and_name(owner_username: $owner, name: $repo) {
        review(number: $number) { ${REVIEW_FIELDS} }
      }
    }`,
    { owner, repo, number },
  )
  return data.repository_by_owner_and_name?.review ?? null
}

export async function createReview(owner: string, repo: string, title: string): Promise<ReviewInfo> {
  const data = await gql<{ create_review: ReviewInfo }>(
    `mutation($owner: String!, $repo: String!, $title: String!) {
      create_review(owner: $owner, repo: $repo, title: $title) { ${REVIEW_FIELDS} }
    }`,
    { owner, repo, title },
  )
  return data.create_review
}

export async function addReviewVersion(
  owner: string,
  repo: string,
  number: number,
  headNode: string,
): Promise<ReviewInfo> {
  const data = await gql<{ add_review_version: ReviewInfo }>(
    `mutation($owner: String!, $repo: String!, $number: Int!, $head_node: String!) {
      add_review_version(owner: $owner, repo: $repo, number: $number, head_node: $head_node) { ${REVIEW_FIELDS} }
    }`,
    { owner, repo, number, head_node: headNode },
  )
  return data.add_review_version
}

export async function landReview(owner: string, repo: string, number: number): Promise<ReviewInfo> {
  const data = await gql<{ land_review: ReviewInfo }>(
    `mutation($owner: String!, $repo: String!, $number: Int!) {
      land_review(owner: $owner, repo: $repo, number: $number) { ${REVIEW_FIELDS} }
    }`,
    { owner, repo, number },
  )
  return data.land_review
}
