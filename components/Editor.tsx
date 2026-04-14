import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

interface EditorProps {
    initialContent?: string;
    onChange: (html: string) => void;
}

export default function Editor({ initialContent, onChange }: EditorProps) {
    const editor = useCreateBlockNote({
        initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    });

    return (
        <BlockNoteView
            editor={editor}
            onChange={() => {
                onChange(JSON.stringify(editor.document));
            }}
        />
    );
}