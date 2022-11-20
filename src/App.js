import Code from './components/Code'
import Navbar from "./components/Navbar";

const rmi = {
    'server_interface': 'import java.rmi.*;\n import java.io.IOException;\n\npublic interface SearchIntf extends Remote {\n\tpublic int search (String file, String key) throws RemoteException, IOException;\n}',
    'server_implementation': 'import java.rmi.*;\nimport java.rmi.server.*;\nimport java.io.File;\nimport java.io.FileReader;\nimport java.io.IOException;\nimport java.io.BufferedReader;\n\npublic class SearchServerImpl extends UnicastRemoteObject implements SearchIntf {\n\n\tpublic SearchServerImpl() throws RemoteException {}\n\tpublic int search(String file, String key) throws RemoteException, IOException {\n\t\tBufferedReader br;\n\t\tFileReader fr;\n\t\ttry {\n\t\t\tFile f1 = new File(file);\n\t\t\tfr = new FileReader(f1);\n\t\t\tbr = new BufferedReader(fr);\n\t\t} catch (Exception e) {\n\t\t\treturn -1;\n\t\t}\n\t\tString[] words = null;\n\t\tString s;\n\t\tint count = 0;\n\t\twhile ((s = br.readLine()) != null) {\n\t\t\twords = s.split(" ");\n\t\t\tfor (String word : words) {\n\t\t\t\tif (word.equals(key)) {\n\t\t\t\t\tcount++;\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\ttry {\n\t\t\tbr.close();\n\t\t\tfr.close();\n\t\t} catch(Exception e) {\n\t\t\t//\n\t\t}\n\t\treturn count;\n\t}\t\n}\t',
    'server': 'import java.rmi.*;\nimport java.net.*;\n\npublic class SearchServer {\n\tpublic static void main(String[] args) {\n\t\ttry {\n\t\t\tSearchServerImpl ssi = new SearchServerImpl();\n\t\t\tNaming.rebind("SearchServer", ssi);\n\t\t} catch (Exception e) {\n\t\t\tSystem.out.println("Exception: " + e);\n\t\t}\n\t}\n}',
    'client': 'import java.rmi.*;\npublic class SearchClient {\n\tpublic static void main (String[] args) {\n\t\ttry {\n\t\t\tString serverUrl = "rmi://" + args[0] + "/SearchServer";\n\t\t\tSearchIntf sin = (SearchIntf)Naming.lookup(serverUrl);\n\t\t\tString file = args[1];\n\t\t\tString key = args[2];\n\t\t\tint count = sin.search(file,key);\n\t\t\tif (count == -1) {\n\t\t\t\tSystem.out.println("File Not Found on Server!");\n\t\t\t}\n\t\t\telse if (count == 0) {\n\t\t\t\tSystem.out.println("Word not found in file");\n\t\t\t}\n\t\t\telse {\n\t\t\t\tSystem.out.println("Number of words found in file: " + count);\n\t\t\t}\n\t\t} catch (Exception e) {\n\t\t\tSystem.out.println("Exception: " + e);\n\t\t}\n\t}\n}',
    'steps': 'Compile all Java Files: javac *.java\nGenerate Stub/Skeleton Files: rmic ServerImplementation\nMove Files to Client: Copy Client.class and ServerImplementation_Stub.class to client\nMove Files to Server: ServerInterface.class, ServerImplementation.class, ServerImplementation_Stub.class, Server.class\nStart the RMI Registry: start rmiregistry\nRun the Server: java Server\nRun the Client: java Client server_ip'
}

const socket = {
    'write_thread': "import java.io.*;\nimport java.net.*;\n \n/**\n * This thread is responsible for reading user's input and send it\n * to the server.\n * It runs in an infinite loop until the user types 'bye' to quit.\n *\n * @author www.codejava.net\n */\npublic class WriteThread extends Thread {\n    private PrintWriter writer;\n    private Socket socket;\n    private ChatClient client;\n \n    public WriteThread(Socket socket, ChatClient client) {\n        this.socket = socket;\n        this.client = client;\n \n        try {\n            OutputStream output = socket.getOutputStream();\n            writer = new PrintWriter(output, true);\n        } catch (IOException ex) {\n            System.out.println(\"Error getting output stream: \" + ex.getMessage());\n            ex.printStackTrace();\n        }\n    }\n \n    public void run() {\n \n        Console console = System.console();\n \n        String userName = console.readLine(\"\\nEnter your name: \");\n        client.setUserName(userName);\n        writer.println(userName);\n \n        String text;\n \n        do {\n            text = console.readLine(\"[\" + userName + \"]: \");\n            writer.println(text);\n \n        } while (!text.equals(\"bye\"));\n \n        try {\n            socket.close();\n        } catch (IOException ex) {\n \n            System.out.println(\"Error writing to server: \" + ex.getMessage());\n        }\n    }\n}",
    'read_thread': "import java.io.*;\nimport java.net.*;\n \n/**\n * This thread is responsible for reading server's input and printing it\n * to the console.\n * It runs in an infinite loop until the client disconnects from the server.\n *\n * @author www.codejava.net\n */\npublic class ReadThread extends Thread {\n    private BufferedReader reader;\n    private Socket socket;\n    private ChatClient client;\n \n    public ReadThread(Socket socket, ChatClient client) {\n        this.socket = socket;\n        this.client = client;\n \n        try {\n            InputStream input = socket.getInputStream();\n            reader = new BufferedReader(new InputStreamReader(input));\n        } catch (IOException ex) {\n            System.out.println(\"Error getting input stream: \" + ex.getMessage());\n            ex.printStackTrace();\n        }\n    }\n \n    public void run() {\n        while (true) {\n            try {\n                String response = reader.readLine();\n                System.out.println(\"\\n\" + response);\n \n                // prints the username after displaying the server's message\n                if (client.getUserName() != null) {\n                    System.out.print(\"[\" + client.getUserName() + \"]: \");\n                }\n            } catch (IOException ex) {\n                System.out.println(\"Error reading from server: \" + ex.getMessage());\n                ex.printStackTrace();\n                break;\n            }\n        }\n    }\n}\n",
    'user_thread': "import java.io.*;\nimport java.net.*;\nimport java.util.*;\n \n/**\n * This thread handles connection for each connected client, so the server\n * can handle multiple clients at the same time.\n *\n * @author www.codejava.net\n */\npublic class UserThread extends Thread {\n    private Socket socket;\n    private ChatServer server;\n    private PrintWriter writer;\n \n    public UserThread(Socket socket, ChatServer server) {\n        this.socket = socket;\n        this.server = server;\n    }\n \n    public void run() {\n        try {\n            InputStream input = socket.getInputStream();\n            BufferedReader reader = new BufferedReader(new InputStreamReader(input));\n \n            OutputStream output = socket.getOutputStream();\n            writer = new PrintWriter(output, true);\n \n            printUsers();\n \n            String userName = reader.readLine();\n            server.addUserName(userName);\n \n            String serverMessage = \"New user connected: \" + userName;\n            server.broadcast(serverMessage, this);\n \n            String clientMessage;\n \n            do {\n                clientMessage = reader.readLine();\n                serverMessage = \"[\" + userName + \"]: \" + clientMessage;\n                server.broadcast(serverMessage, this);\n \n            } while (!clientMessage.equals(\"bye\"));\n \n            server.removeUser(userName, this);\n            socket.close();\n \n            serverMessage = userName + \" has quitted.\";\n            server.broadcast(serverMessage, this);\n \n        } catch (IOException ex) {\n            System.out.println(\"Error in UserThread: \" + ex.getMessage());\n            ex.printStackTrace();\n        }\n    }\n \n    /**\n     * Sends a list of online users to the newly connected user.\n     */\n    void printUsers() {\n        if (server.hasUsers()) {\n            writer.println(\"Connected users: \" + server.getUserNames());\n        } else {\n            writer.println(\"No other users connected\");\n        }\n    }\n \n    /**\n     * Sends a message to the client.\n     */\n    void sendMessage(String message) {\n        writer.println(message);\n    }\n}\n",
    'chat_server': "import java.io.*;\nimport java.net.*;\nimport java.util.*;\n \n/**\n * This is the chat server program.\n * Press Ctrl + C to terminate the program.\n *\n * @author www.codejava.net\n */\npublic class ChatServer {\n    private int port;\n    private Set<String> userNames = new HashSet<>();\n    private Set<UserThread> userThreads = new HashSet<>();\n \n    public ChatServer(int port) {\n        this.port = port;\n    }\n \n    public void execute() {\n        try (ServerSocket serverSocket = new ServerSocket(port)) {\n \n            System.out.println(\"Chat Server is listening on port \" + port);\n \n            while (true) {\n                Socket socket = serverSocket.accept();\n                System.out.println(\"New user connected\");\n \n                UserThread newUser = new UserThread(socket, this);\n                userThreads.add(newUser);\n                newUser.start();\n \n            }\n \n        } catch (IOException ex) {\n            System.out.println(\"Error in the server: \" + ex.getMessage());\n            ex.printStackTrace();\n        }\n    }\n \n    public static void main(String[] args) {\n        if (args.length < 1) {\n            System.out.println(\"Syntax: java ChatServer <port-number>\");\n            System.exit(0);\n        }\n \n        int port = Integer.parseInt(args[0]);\n \n        ChatServer server = new ChatServer(port);\n        server.execute();\n    }\n \n    /**\n     * Delivers a message from one user to others (broadcasting)\n     */\n    void broadcast(String message, UserThread excludeUser) {\n        for (UserThread aUser : userThreads) {\n            if (aUser != excludeUser) {\n                aUser.sendMessage(message);\n            }\n        }\n    }\n \n    /**\n     * Stores username of the newly connected client.\n     */\n    void addUserName(String userName) {\n        userNames.add(userName);\n    }\n \n    /**\n     * When a client is disconneted, removes the associated username and UserThread\n     */\n    void removeUser(String userName, UserThread aUser) {\n        boolean removed = userNames.remove(userName);\n        if (removed) {\n            userThreads.remove(aUser);\n            System.out.println(\"The user \" + userName + \" quitted\");\n        }\n    }\n \n    Set<String> getUserNames() {\n        return this.userNames;\n    }\n \n    /**\n     * Returns true if there are other users connected (not count the currently connected user)\n     */\n    boolean hasUsers() {\n        return !this.userNames.isEmpty();\n    }\n}",
    'chat_client': "import java.net.*;\nimport java.io.*;\n \n/**\n * This is the chat client program.\n * Type 'bye' to terminte the program.\n *\n * @author www.codejava.net\n */\npublic class ChatClient {\n    private String hostname;\n    private int port;\n    private String userName;\n \n    public ChatClient(String hostname, int port) {\n        this.hostname = hostname;\n        this.port = port;\n    }\n \n    public void execute() {\n        try {\n            Socket socket = new Socket(hostname, port);\n \n            System.out.println(\"Connected to the chat server\");\n \n            new ReadThread(socket, this).start();\n            new WriteThread(socket, this).start();\n \n        } catch (UnknownHostException ex) {\n            System.out.println(\"Server not found: \" + ex.getMessage());\n        } catch (IOException ex) {\n            System.out.println(\"I/O Error: \" + ex.getMessage());\n        }\n \n    }\n \n    void setUserName(String userName) {\n        this.userName = userName;\n    }\n \n    String getUserName() {\n        return this.userName;\n    }\n \n \n    public static void main(String[] args) {\n        if (args.length < 2) return;\n \n        String hostname = args[0];\n        int port = Integer.parseInt(args[1]);\n \n        ChatClient client = new ChatClient(hostname, port);\n        client.execute();\n    }\n}"
}

function App() {
    return (
        <div className="App">
            <h1 id="rmi" className="text-center">Java RMI</h1>
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
            <h1 id="multi" className="text-center">Java Socket Programming: MultiClient Chat</h1>
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
