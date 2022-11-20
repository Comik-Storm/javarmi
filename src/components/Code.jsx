import { CodeBlock, dracula } from "react-code-blocks";

const Code = ({ code, language, showLineNumbers }) => {
    return (
        <CodeBlock
            text={code}
            language={language}
            showLineNumbers={showLineNumbers}
            theme={dracula}
        />
    );
}

export default Code;