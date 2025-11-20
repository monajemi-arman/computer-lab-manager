import { FileBrowser } from "./file-browser";

export function FileBrowseView() {
    return (
        <FileBrowser
            entries={[
                { name: "src", type: "folder" },
                { name: "README.md", type: "file" },
                { name: "package.json", type: "file" },
            ]}
            onOpen={(name) => console.log("Open:", name)}
            onDelete={(name) => console.log("Delete:", name)}
            onDownload={(name) => console.log("Download:", name)}
        />
    )
}