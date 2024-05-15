export default function validateAccountId(accountID: string): boolean {
  return (
    accountID.length >= 2 &&
    accountID.length <= 64 &&
    new RegExp(/^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/).test(
      accountID
    )
  );
}
