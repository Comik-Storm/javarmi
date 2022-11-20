import Code from './components/Code'

const rmi = {
    'server_interface': 'import java.rmi.*;\n import java.io.IOException;\n\npublic interface SearchIntf extends Remote {\n\tpublic int search (String file, String key) throws RemoteException, IOException;\n}',
    'server_implementation': 'import java.rmi.*;\nimport java.rmi.server.*;\nimport java.io.File;\nimport java.io.FileReader;\nimport java.io.IOException;\nimport java.io.BufferedReader;\n\npublic class SearchServerImpl extends UnicastRemoteObject implements SearchIntf {\n\n\tpublic SearchServerImpl() throws RemoteException {}\n\tpublic int search(String file, String key) throws RemoteException, IOException {\n\t\tBufferedReader br;\n\t\tFileReader fr;\n\t\ttry {\n\t\t\tFile f1 = new File(file);\n\t\t\tfr = new FileReader(f1);\n\t\t\tbr = new BufferedReader(fr);\n\t\t} catch (Exception e) {\n\t\t\treturn -1;\n\t\t}\n\t\tString[] words = null;\n\t\tString s;\n\t\tint count = 0;\n\t\twhile ((s = br.readLine()) != null) {\n\t\t\twords = s.split(" ");\n\t\t\tfor (String word : words) {\n\t\t\t\tif (word.equals(key)) {\n\t\t\t\t\tcount++;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\ttry {\n\t\t\tbr.close();\n\t\t\tfr.close();\n\t\t} catch(Exception e) {\n\t\t\t//\n\t\t}\n\t\treturn count;\n\t}\t\n}\t',
    'server': 'import java.rmi.*;\nimport java.net.*;\n\npublic class SearchServer {\n\tpublic static void main(String[] args) {\n\t\ttry {\n\t\t\tSearchServerImpl ssi = new SearchServerImpl();\n\t\t\tNaming.rebind("SearchServer", ssi);\n\t\t} catch (Exception e) {\n\t\t\tSystem.out.println("Exception: " + e);\n\t\t}\n\t}\n}',
    'client': 'import java.rmi.*;\npublic class SearchClient {\n\tpublic static void main (String[] args) {\n\t\ttry {\n\t\t\tString serverUrl = "rmi://" + args[0] + "/SearchServer";\n\t\t\tSearchIntf sin = (SearchIntf)Naming.lookup(serverUrl);\n\t\t\tString file = args[1];\n\t\t\tString key = args[2];\n\t\t\tint count = sin.search(file,key);\n\t\t\tif (count == -1) {\n\t\t\t\tSystem.out.println("File Not Found on Server!");\n\t\t\t}\n\t\t\telse if (count == 0) {\n\t\t\t\tSystem.out.println("Word not found in file");\n\t\t\t}\n\t\t\telse {\n\t\t\t\tSystem.out.println("Number of words found in file: " + count);\n\t\t\t}\n\t\t} catch (Exception e) {\n\t\t\tSystem.out.println("Exception: " + e);\n\t\t}\n\t}\n}',
    'steps': 'Compile all Java Files: javac *.java\nGenerate Stub/Skeleton Files: rmic ServerImplementation\nMove Files to Client: Copy Client.class and ServerImplementation_Stub.class to client\nMove Files to Server: ServerInterface.class, ServerImplementation.class, ServerImplementation_Stub.class, Server.class\nStart the RMI Registry: start rmiregistry\nRun the Server: java Server\nRun the Client: java Client server_ip'
}

const socket = {
    'write_thread': "import java.io.*;\nimport java.net.*;\n \n/**\n * This thread is responsible for reading user\'s input and send it\n * to the server.\n * It runs in an infinite loop until the user types \'bye\' to quit.\n *\n * @author www.codejava.net\n */\npublic class WriteThread extends Thread {\n    private PrintWriter writer;\n    private Socket socket;\n    private ChatClient client;\n \n    public WriteThread(Socket socket, ChatClient client) {\n        this.socket = socket;\n        this.client = client;\n \n        try {\n            OutputStream output = socket.getOutputStream();\n            writer = new PrintWriter(output, true);\n        } catch (IOException ex) {\n            System.out.println(\"Error getting output stream: \" + ex.getMessage());\n            ex.printStackTrace();\n        }\n    }\n \n    public void run() {\n \n        Console console = System.console();\n \n        String userName = console.readLine(\"\\nEnter your name: \");\n        client.setUserName(userName);\n        writer.println(userName);\n \n        String text;\n \n        do {\n            text = console.readLine(\"[\" + userName + \"]: \");\n            writer.println(text);\n \n        } while (!text.equals(\"bye\"));\n \n        try {\n            socket.close();\n        } catch (IOException ex) {\n \n            System.out.println(\"Error writing to server: \" + ex.getMessage());\n        }\n    }\n}",
    'read_thread': "import java.io.*;\nimport java.net.*;\n \n/**\n * This thread is responsible for reading server\'s input and printing it\n * to the console.\n * It runs in an infinite loop until the client disconnects from the server.\n *\n * @author www.codejava.net\n */\npublic class ReadThread extends Thread {\n    private BufferedReader reader;\n    private Socket socket;\n    private ChatClient client;\n \n    public ReadThread(Socket socket, ChatClient client) {\n        this.socket = socket;\n        this.client = client;\n \n        try {\n            InputStream input = socket.getInputStream();\n            reader = new BufferedReader(new InputStreamReader(input));\n        } catch (IOException ex) {\n            System.out.println(\"Error getting input stream: \" + ex.getMessage());\n            ex.printStackTrace();\n        }\n    }\n \n    public void run() {\n        while (true) {\n            try {\n                String response = reader.readLine();\n                System.out.println(\"\\n\" + response);\n \n                // prints the username after displaying the server\'s message\n                if (client.getUserName() != null) {\n                    System.out.print(\"[\" + client.getUserName() + \"]: \");\n                }\n            } catch (IOException ex) {\n                System.out.println(\"Error reading from server: \" + ex.getMessage());\n                ex.printStackTrace();\n                break;\n            }\n        }\n    }\n}\n",
    'user_thread': "import java.io.*;\nimport java.net.*;\nimport java.util.*;\n \n/**\n * This thread handles connection for each connected client, so the server\n * can handle multiple clients at the same time.\n *\n * @author www.codejava.net\n */\npublic class UserThread extends Thread {\n    private Socket socket;\n    private ChatServer server;\n    private PrintWriter writer;\n \n    public UserThread(Socket socket, ChatServer server) {\n        this.socket = socket;\n        this.server = server;\n    }\n \n    public void run() {\n        try {\n            InputStream input = socket.getInputStream();\n            BufferedReader reader = new BufferedReader(new InputStreamReader(input));\n \n            OutputStream output = socket.getOutputStream();\n            writer = new PrintWriter(output, true);\n \n            printUsers();\n \n            String userName = reader.readLine();\n            server.addUserName(userName);\n \n            String serverMessage = \"New user connected: \" + userName;\n            server.broadcast(serverMessage, this);\n \n            String clientMessage;\n \n            do {\n                clientMessage = reader.readLine();\n                serverMessage = \"[\" + userName + \"]: \" + clientMessage;\n                server.broadcast(serverMessage, this);\n \n            } while (!clientMessage.equals(\"bye\"));\n \n            server.removeUser(userName, this);\n            socket.close();\n \n            serverMessage = userName + \" has quitted.\";\n            server.broadcast(serverMessage, this);\n \n        } catch (IOException ex) {\n            System.out.println(\"Error in UserThread: \" + ex.getMessage());\n            ex.printStackTrace();\n        }\n    }\n \n    /**\n     * Sends a list of online users to the newly connected user.\n     */\n    void printUsers() {\n        if (server.hasUsers()) {\n            writer.println(\"Connected users: \" + server.getUserNames());\n        } else {\n            writer.println(\"No other users connected\");\n        }\n    }\n \n    /**\n     * Sends a message to the client.\n     */\n    void sendMessage(String message) {\n        writer.println(message);\n    }\n}\n",
    'chat_server': `import java.io.*;
import java.net.*;
import java.util.*;
 
/**
 * This is the chat server program.
 * Press Ctrl + C to terminate the program.
 *
 * @author www.codejava.net
 */
public class ChatServer {
    private int port;
    private Set<String> userNames = new HashSet<>();
    private Set<UserThread> userThreads = new HashSet<>();
 
    public ChatServer(int port) {
        this.port = port;
    }
 
    public void execute() {
        try (ServerSocket serverSocket = new ServerSocket(port)) {
 
            System.out.println("Chat Server is listening on port " + port);
 
            while (true) {
                Socket socket = serverSocket.accept();
                System.out.println("New user connected");
 
                UserThread newUser = new UserThread(socket, this);
                userThreads.add(newUser);
                newUser.start();
 
            }
 
        } catch (IOException ex) {
            System.out.println("Error in the server: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
 
    public static void main(String[] args) {
        if (args.length < 1) {
            System.out.println("Syntax: java ChatServer <port-number>");
            System.exit(0);
        }
 
        int port = Integer.parseInt(args[0]);
 
        ChatServer server = new ChatServer(port);
        server.execute();
    }
 
    /**
     * Delivers a message from one user to others (broadcasting)
     */
    void broadcast(String message, UserThread excludeUser) {
        for (UserThread aUser : userThreads) {
            if (aUser != excludeUser) {
                aUser.sendMessage(message);
            }
        }
    }
 
    /**
     * Stores username of the newly connected client.
     */
    void addUserName(String userName) {
        userNames.add(userName);
    }
 
    /**
     * When a client is disconneted, removes the associated username and UserThread
     */
    void removeUser(String userName, UserThread aUser) {
        boolean removed = userNames.remove(userName);
        if (removed) {
            userThreads.remove(aUser);
            System.out.println("The user " + userName + " quitted");
        }
    }
 
    Set<String> getUserNames() {
        return this.userNames;
    }
 
    /**
     * Returns true if there are other users connected (not count the currently connected user)
     */
    boolean hasUsers() {
        return !this.userNames.isEmpty();
    }
}`,
    'chat_client': `import java.net.*;
import java.io.*;
 
/**
 * This is the chat client program.
 * Type 'bye' to terminte the program.
 *
 * @author www.codejava.net
 */
public class ChatClient {
    private String hostname;
    private int port;
    private String userName;
 
    public ChatClient(String hostname, int port) {
        this.hostname = hostname;
        this.port = port;
    }
 
    public void execute() {
        try {
            Socket socket = new Socket(hostname, port);
 
            System.out.println("Connected to the chat server");
 
            new ReadThread(socket, this).start();
            new WriteThread(socket, this).start();
 
        } catch (UnknownHostException ex) {
            System.out.println("Server not found: " + ex.getMessage());
        } catch (IOException ex) {
            System.out.println("I/O Error: " + ex.getMessage());
        }
 
    }
 
    void setUserName(String userName) {
        this.userName = userName;
    }
 
    String getUserName() {
        return this.userName;
    }
 
 
    public static void main(String[] args) {
        if (args.length < 2) return;
 
        String hostname = args[0];
        int port = Integer.parseInt(args[1]);
 
        ChatClient client = new ChatClient(hostname, port);
        client.execute();
    }
}`
}

function App() {
    return (
        <div className="App">
            <h1 className="text-center">Java RMI</h1>
            <h2 className="text-primary">Server Interface</h2>
            <Code code={rmi.server_interface}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">Server Implementation</h2>
            <Code code={rmi.server_implementation}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">Server</h2>
            <Code code={rmi.server}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">Client</h2>
            <Code code={rmi.client}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-info">How to Run</h2>
            <Code code={rmi.steps}
                  language='bash'
                  showLineNumbers={true} />
            <br/><br/><hr/><br/><br/>
            <h1 className="text-center">Java Socket Programming: MultiClient Chat</h1>
            <h2 className="text-primary">ChatClient.java</h2>
            <Code code={socket.chat_client}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">ChatServer.java</h2>
            <Code code={socket.chat_server}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">ReadThread.java</h2>
            <Code code={socket.read_thread}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">WriteThread.java</h2>
            <Code code={socket.write_thread}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">UserThread.java</h2>
            <Code code={socket.user_thread}
                  language='java'
                  showLineNumbers={true} />
        </div>
    );
}

export default App;
