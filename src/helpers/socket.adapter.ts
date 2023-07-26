import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";

export class SocketAdapter extends IoAdapter {
    createIOServer(
        port: number,
        options?: ServerOptions & {
            namespace?: string;
            server?: any;
        }
    ): any {

        const envPort = process.env.SOCKET_PORT;
        console.log(`Socket port:${envPort}`)
        // options.namespace = "chitchat";
        const server = super.createIOServer(parseInt(envPort), { ...options, cors: true });
        return server;
    }
}
