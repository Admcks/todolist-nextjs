import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

interface EditorProps {
    initialContent?: string;
    onChange: (json: string) => void;
}

export default function Editor({ initialContent, onChange }: EditorProps) {

    const getSafeInitialContent = () => {
        if (!initialContent) return undefined;

        try {
            return JSON.parse(initialContent);
        } catch (e) {
            return [
                {
                    type: "paragraph",
                    content: [{ type: "text", text: initialContent, styles: {} }],
                },
            ];
        }
    };
    const editor = useCreateBlockNote({
        initialContent: getSafeInitialContent(),
    });

    return (
        <BlockNoteView
            editor={editor}
            theme="dark"
            onChange={() => {
                onChange(JSON.stringify(editor.document));
            }}
        />
    );
}
