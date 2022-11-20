import logo from './logo.svg';
import Code from './components/Code'

const code = {
    'server_interface': 'import java.rmi.*;\n' +
        'import java.io.IOException;\n' +
        '\n' +
        'public interface SearchIntf extends Remote {\n' +
        '\tpublic int search (String file, String key) throws RemoteException, IOException;\n' +
        '}',
    'server_implementation': 'import java.rmi.*;\n' +
        'import java.rmi.server.*;\n' +
        'import java.io.File;\n' +
        'import java.io.FileReader;\n' +
        'import java.io.IOException;\n' +
        'import java.io.BufferedReader;\n' +
        '\n' +
        'public class SearchServerImpl extends UnicastRemoteObject implements SearchIntf {\n' +
        '\n' +
        '\tpublic SearchServerImpl() throws RemoteException {}\n' +
        '\tpublic int search(String file, String key) throws RemoteException, IOException {\n' +
        '\t\tBufferedReader br;\n' +
        '\t\tFileReader fr;\n' +
        '\t\ttry {\n' +
        '\t\t\tFile f1 = new File(file);\n' +
        '\t\t\tfr = new FileReader(f1);\n' +
        '\t\t\tbr = new BufferedReader(fr);\n' +
        '\t\t} catch (Exception e) {\n' +
        '\t\t\treturn -1;\n' +
        '\t\t}\n' +
        '\t\tString[] words = null;\n' +
        '\t\tString s;\n' +
        '\t\tint count = 0;\n' +
        '\t\twhile ((s = br.readLine()) != null) {\n' +
        '\t\t\twords = s.split(" ");\n' +
        '\t\t\tfor (String word : words) {\n' +
        '\t\t\t\tif (word.equals(key)) {\n' +
        '\t\t\t\t\tcount++;\n' +
        '\t\t\t\t}\n' +
        '\t\t\t}\n' +
        '\t\t}\n' +
        '\t\ttry {\n' +
        '\t\t\tbr.close();\n' +
        '\t\t\tfr.close();\n' +
        '\t\t} catch(Exception e) {\n' +
        '\t\t\t//\n' +
        '\t\t}\n' +
        '\t\treturn count;\n' +
        '\t}\t\n' +
        '}\t',
    'server': 'import java.rmi.*;\n' +
        'import java.net.*;\n' +
        '\n' +
        'public class SearchServer {\n' +
        '\tpublic static void main(String[] args) {\n' +
        '\t\ttry {\n' +
        '\t\t\tSearchServerImpl ssi = new SearchServerImpl();\n' +
        '\t\t\tNaming.rebind("SearchServer", ssi);\n' +
        '\t\t} catch (Exception e) {\n' +
        '\t\t\tSystem.out.println("Exception: " + e);\n' +
        '\t\t}\n' +
        '\t}\n' +
        '}',
    'client': 'import java.rmi.*;\n' +
        'public class SearchClient {\n' +
        '\tpublic static void main (String[] args) {\n' +
        '\t\ttry {\n' +
        '\t\t\tString serverUrl = "rmi://" + args[0] + "/SearchServer";\n' +
        '\t\t\tSearchIntf sin = (SearchIntf)Naming.lookup(serverUrl);\n' +
        '\t\t\tString file = args[1];\n' +
        '\t\t\tString key = args[2];\n' +
        '\t\t\tint count = sin.search(file,key);\n' +
        '\t\t\tif (count == -1) {\n' +
        '\t\t\t\tSystem.out.println("File Not Found on Server!");\n' +
        '\t\t\t}\n' +
        '\t\t\telse if (count == 0) {\n' +
        '\t\t\t\tSystem.out.println("Word not found in file");\n' +
        '\t\t\t}\n' +
        '\t\t\telse {\n' +
        '\t\t\t\tSystem.out.println("Number of words found in file: " + count);\n' +
        '\t\t\t}\n' +
        '\t\t} catch (Exception e) {\n' +
        '\t\t\tSystem.out.println("Exception: " + e);\n' +
        '\t\t}\n' +
        '\t}\n' +
        '}',
    'steps': 'Compile all Java Files: javac *.java' + '\n' +
        'Generate Stub/Skeleton Files: rmic ServerImplementation' + '\n' +
        'Move Files to Client: Copy Client.class and ServerImplementation_Stub.class to client' + '\n' +
        'Move Files to Server: ServerInterface.class, ServerImplementation.class, ServerImplementation_Stub.class, Server.class' + '\n' +
        'Start the RMI Registry: start rmiregistry' + '\n' +
        'Run the Server: java Server' + '\n' +
        'Run the Client: java Client server_ip'
}

function App() {
    return (
        <div className="App">
            <h1 className="text-center">Java RMI</h1>
            <h2 className="text-primary">Server Interface</h2>
            <Code code={code.server_interface}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">Server Interface</h2>
            <Code code={code.server_interface}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">Server</h2>
            <Code code={code.server}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-primary">Client</h2>
            <Code code={code.client}
                  language='java'
                  showLineNumbers={true} />
            <br/>
            <h2 className="text-info">How to Run</h2>
            <Code code={code.steps}
                  language='bash'
                  showLineNumbers={true} />
        </div>
    );
}

export default App;
