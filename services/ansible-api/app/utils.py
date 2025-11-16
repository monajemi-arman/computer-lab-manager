import re
from textwrap import indent

def prettify_ansible_output(raw: str) -> str:
    """
    Cleans and formats noisy Ansible or terminal log output.
    - Removes ANSI escape sequences
    - Normalizes spacing
    - Adds friendly formatting around task blocks
    """
    
    # 1. Remove ANSI escape sequences
    cleaned = re.sub(r'\x1b\[[0-9;]*m', '', raw)
    
    # 2. Normalize repeated blank lines
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    
    # 3. Format sections more clearly
    # Convert lines like "TASK [something] *************" to headings
    cleaned = re.sub(
        r'(?m)^TASK \[(.*?)\] \*+',
        lambda m: f"\n=== TASK: {m.group(1)} ===",
        cleaned
    )

    # 4. Format PLAY and PLAY RECAP headers nicely
    cleaned = re.sub(
        r'(?m)^PLAY \[(.*?)\] \*+',
        lambda m: f"\n### PLAY: {m.group(1)} ###",
        cleaned
    )

    cleaned = re.sub(
        r'(?m)^PLAY RECAP \*+',
        "\n### PLAY RECAP ###",
        cleaned
    )

    # 5. Indent dictionary-style blocks
    cleaned = re.sub(
        r'(?m)^(ok: \[.*?]) => \{',
        lambda m: m.group(0) + "\n",
        cleaned
    )

    # 6. Minor beautification: trim outer whitespace
    cleaned = cleaned.strip() + "\n"

    return cleaned
