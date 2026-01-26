import { Near, generateKey, PrivateKey } from 'near-kit';
import { Sandbox } from 'near-kit/sandbox';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface TestContext {
  sandbox: Sandbox;
  near: Near;
  contractId: string;
  rootAccountId: string;
}

export async function createTestSandbox(
  contractPrefix: string
): Promise<TestContext> {
  const sandbox = await Sandbox.start();
  const rootAccountId = sandbox.rootAccount.id;

  const near = new Near({ network: sandbox, defaultWaitUntil: 'FINAL' });

  const contractId = `${contractPrefix}.${rootAccountId}`;

  const wasmPath = join(__dirname, 'contracts', 'graph_db.wasm');
  const wasm = readFileSync(wasmPath);

  const contractKey = generateKey();

  await near
    .transaction(rootAccountId)
    .createAccount(contractId)
    .transfer(contractId, '50 NEAR')
    .addKey(contractKey.publicKey.toString(), { type: 'fullAccess' })
    .deployContract(contractId, wasm)
    .functionCall(contractId, 'new', {})
    .send();

  await near
    .transaction(contractId)
    .functionCall(contractId, 'set_status', { status: 'Live' })
    .signWith(contractKey.secretKey as PrivateKey)
    .send();

  await near
    .transaction(rootAccountId)
    .functionCall(
      contractId,
      'storage_deposit',
      {},
      { gas: '30 Tgas', attachedDeposit: '1 NEAR' }
    )
    .send();

  await near
    .transaction(rootAccountId)
    .functionCall(
      contractId,
      'set',
      {
        data: {
          [rootAccountId]: {
            profile: {
              name: 'Initial Setup',
            },
          },
        },
      },
      { gas: '100 Tgas', attachedDeposit: '1 yocto' }
    )
    .send();

  return {
    sandbox,
    near,
    contractId,
    rootAccountId,
  };
}

export async function stopTestSandbox(ctx: TestContext): Promise<void> {
  if (ctx?.sandbox) {
    await ctx.sandbox.stop();
  }
}
