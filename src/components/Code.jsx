import { CopyBlock, dracula } from "react-code-blocks";

const Code = ({ code, language, showLineNumbers }) => {
    return (
        <CopyBlock
            text={code}
            language={language}
            showLineNumbers={showLineNumbers}
            theme={dracula}
        />
    );
}

export default Code;