import { Firestore, collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ConnectionRequest } from "../../../types/DataStoreTypes";
import { FirebaseUtils } from "../util/FirebaseUtils";

export interface UseConnectionsResult {
    activeConnections: string[];
    incomingRequests: ConnectionRequest[];
    outgoingRequests: ConnectionRequest[];
    isLoading: boolean;
}

export function useConnections(userEmail: string | undefined): UseConnectionsResult {
    const [activeConnections, setActiveConnections] = useState<string[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userEmail) {
            setActiveConnections([]);
            setIncomingRequests([]);
            setOutgoingRequests([]);
            setIsLoading(false);
            return;
        }

        const db: Firestore = FirebaseUtils.getFirestoreDatabase();
        setIsLoading(true);

        const unsubscribeUser = onSnapshot(doc(db, "users", userEmail), (snapshot) => {
            const data = snapshot.data();
            setActiveConnections((data?.canView as string[] | undefined) ?? []);
            setIsLoading(false);
        });

        const unsubscribeRequests = onSnapshot(
            collection(db, "users", userEmail, "connectionRequests"),
            (snapshot) => {
                const incoming: ConnectionRequest[] = [];
                const outgoing: ConnectionRequest[] = [];

                snapshot.forEach((requestDoc) => {
                    const request = requestDoc.data() as ConnectionRequest;
                    if (request.direction === "incoming") {
                        incoming.push(request);
                    } else {
                        outgoing.push(request);
                    }
                });

                setIncomingRequests(incoming);
                setOutgoingRequests(outgoing);
            }
        );

        return () => {
            unsubscribeUser();
            unsubscribeRequests();
        };
    }, [userEmail]);

    return { activeConnections, incomingRequests, outgoingRequests, isLoading };
}
