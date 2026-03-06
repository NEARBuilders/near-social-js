import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { Near, generateKey } from "near-kit";
import { useWallet } from "../integrations/near-wallet";
import { useGraphInstance } from "../integrations/near-graph";

const DELEGATE_KEY_STORAGE = "near_social_delegate_key";
const API_ENABLED_STORAGE = "near_social_api_enabled";

interface ApiContextValue {
	isApiEnabled: boolean;
	toggleApi: () => Promise<void>;
	delegatePublicKey: string | null;
	delegateNear: Near | null;
	deleteDelegateKey: () => void;
	isLoading: boolean;
	canToggle: boolean;
}

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
	const [isApiEnabled, setApiEnabled] = useState(() => {
		if (typeof window === "undefined") return false;
		const stored = localStorage.getItem(API_ENABLED_STORAGE);
		return stored === "true";
	});
	const [delegatePrivateKey, setDelegatePrivateKey] = useState<string | null>(
		null,
	);
	const [delegatePublicKey, setDelegatePublicKey] = useState<string | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const { near: walletNear, accountId } = useWallet();
	const graph = useGraphInstance();

	useEffect(() => {
		const stored = localStorage.getItem(DELEGATE_KEY_STORAGE);
		if (stored) {
			try {
				const parsed = JSON.parse(stored) as {
					privateKey: string;
					publicKey: string;
				};
				const isValidKey =
					parsed.privateKey?.startsWith("ed25519:") ||
					parsed.privateKey?.startsWith("secp256k1:");
				if (isValidKey && parsed.publicKey) {
					setDelegatePrivateKey(parsed.privateKey);
					setDelegatePublicKey(parsed.publicKey);
				} else {
					localStorage.removeItem(DELEGATE_KEY_STORAGE);
				}
			} catch {
				localStorage.removeItem(DELEGATE_KEY_STORAGE);
			}
		}
	}, []);

	useEffect(() => {
		if (!delegatePrivateKey) {
			const keyPair = generateKey();
			const privateKey = keyPair.secretKey.toString();
			const publicKey = keyPair.publicKey.toString();

			setDelegatePrivateKey(privateKey);
			setDelegatePublicKey(publicKey);

			localStorage.setItem(
				DELEGATE_KEY_STORAGE,
				JSON.stringify({ privateKey, publicKey }),
			);
		}
	}, [delegatePrivateKey]);

	const delegateNear = useMemo(() => {
		if (!delegatePrivateKey) return null;
		if (
			!delegatePrivateKey.startsWith("ed25519:") &&
			!delegatePrivateKey.startsWith("secp256k1:")
		) {
			return null;
		}
		return new Near({
			network: "mainnet",
			privateKey: delegatePrivateKey as `ed25519:${string}`,
		});
	}, [delegatePrivateKey]);

	const checkKeyRegistered = useCallback(async (): Promise<boolean> => {
		if (!accountId || !delegatePublicKey) return false;
		try {
			const result = await graph.isWritePermissionGranted({
				key: `${accountId}/`,
				granteePublicKey: delegatePublicKey,
			});
			return result;
		} catch {
			return false;
		}
	}, [accountId, delegatePublicKey, graph]);

	const toggleApi = useCallback(async () => {
		if (isApiEnabled) {
			setApiEnabled(false);
			localStorage.setItem(API_ENABLED_STORAGE, "false");
			return;
		}

		if (!walletNear || !accountId || !delegatePublicKey) {
			throw new Error("Wallet not connected or delegate key not initialized");
		}

		setIsLoading(true);
		try {
			const isRegistered = await checkKeyRegistered();

			if (!isRegistered) {
				const contractId = graph.getContractId();
				const txBuilder = walletNear
					.transaction(accountId)
					.addKey(delegatePublicKey, {
						type: "functionCall",
						receiverId: contractId,
						methodNames: [],
						allowance: "0.25 NEAR",
					});
				await txBuilder.send();
			}

			setApiEnabled(true);
			localStorage.setItem(API_ENABLED_STORAGE, "true");
		} finally {
			setIsLoading(false);
		}
	}, [
		isApiEnabled,
		walletNear,
		accountId,
		delegatePublicKey,
		graph,
		checkKeyRegistered,
	]);

	const deleteDelegateKey = useCallback(() => {
		localStorage.removeItem(DELEGATE_KEY_STORAGE);
		localStorage.setItem(API_ENABLED_STORAGE, "false");
		setDelegatePrivateKey(null);
		setDelegatePublicKey(null);
		setApiEnabled(false);
	}, []);

	const canToggle =
		isApiEnabled || (!!walletNear && !!accountId && !!delegatePublicKey);

	return (
		<ApiContext.Provider
			value={{
				isApiEnabled,
				toggleApi,
				delegatePublicKey,
				delegateNear,
				deleteDelegateKey,
				isLoading,
				canToggle,
			}}
		>
			{children}
		</ApiContext.Provider>
	);
}

export function useApi() {
	const context = useContext(ApiContext);
	if (!context) {
		throw new Error("useApi must be used within an ApiProvider");
	}
	return context;
}
