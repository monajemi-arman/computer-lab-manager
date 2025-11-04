"use client"

import { useState, useRef, useEffect } from "react";
import { Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IComputerInput } from "@/types/computer";

export function ListInput({
  items,
  hostname,
  computer,
  onOpenChange,
  placeholder = "Add item...",
  maxPreview = 3,
}: {
  items: string[],
  hostname: string,
  computer: IComputerInput,
  onOpenChange: (open: boolean) => void,
  placeholder?: string,
  maxPreview?: number
}) {
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();

  const editComputerUsers = useMutation({
    mutationFn: async (newUsers: string[]) => {
      const newComputer: Partial<IComputerInput> = computer;
      newComputer.users = newUsers;

      const res = await fetch('/api/computer/' + hostname, {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newComputer)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to save computer: ${res.status} ${text}`);
      }
      return res.json().catch(() => null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['computers'] });
    }
  })

  const addUsernameToComputer = (username: string, hostname: string) => {
    if (!username || !hostname) return;
    const newUsers = [...items, username];
    editComputerUsers.mutate(newUsers);
  };
  const removeUsernameFromComputer = (username: string, hostname: string) => {
    if (!username || !hostname) return;
    const newUsers = items.filter((x) => x !== username);
    editComputerUsers.mutate(newUsers);
  };

  const handleAdd = () => {
    if (input.trim()) {
      addUsernameToComputer(input.trim(), hostname);
      setInput("")
    }
  }

  const handleRemove = (itemToRemove: string) => {
    removeUsernameFromComputer(itemToRemove, hostname);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd()
    }
  }

  // Effect to handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close if the click is outside the dialog content itself
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onOpenChange]);

  const filteredItems = items.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))

  // Determine which items to display
  const displayItems = isExpanded ? filteredItems : filteredItems.slice(0, maxPreview)
  const hasMore = filteredItems.length > maxPreview

  const styles = {
    // New overlay container style
    overlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000, // Ensure it's above other content
    },
    // New dialog content style
    dialogContent: {
      backgroundColor: "#fff",
      padding: "1.5rem",
      paddingTop: "3rem",
      borderRadius: "0.75rem",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      width: "90%", // Max width for responsiveness
      maxWidth: "400px", // Max width for larger screens
      position: "relative" as const, // For positioning the close button
      display: "flex",
      flexDirection: "column" as const,
      gap: "1rem",
    },
    searchContainer: {
      position: "relative" as const,
    },
    searchIcon: {
      position: "absolute" as const,
      left: "0.75rem",
      top: "50%",
      transform: "translateY(-50%)",
      width: "1rem",
      height: "1rem",
      color: "#9ca3af",
    },
    inputGroup: {
      display: "flex",
      gap: "0.5rem",
    },
    itemsContainer: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5rem",
    },
    itemRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.75rem",
      backgroundColor: "#f3f4f6",
      borderRadius: "0.5rem",
      border: "1px solid #d1d5db",
      transition: "all 0.2s ease-in-out",
    },
    itemRowHover: {
      borderColor: "#9ca3af",
      backgroundColor: "#f9fafb",
    },
    itemText: {
      color: "#000",
      fontWeight: "500",
      fontSize: "0.875rem",
    },
    removeButton: {
      padding: "0.375rem",
      borderRadius: "0.375rem",
      backgroundColor: "#f3f4f6",
      color: "#4b5563",
      border: "none",
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
      opacity: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    expandButton: {
      width: "100%",
      padding: "0.75rem",
      textAlign: "center" as const,
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#000",
      backgroundColor: "#fff",
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      cursor: "pointer",
      transition: "all 0.2s ease-in-out",
    },
    expandButtonHover: {
      color: "#fff",
      backgroundColor: "#000",
      borderColor: "#000",
    },
    itemCount: {
      fontSize: "0.75rem",
      color: "#9ca3af",
      textAlign: "center" as const,
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
    },
    emptyState: {
      textAlign: "center" as const,
      paddingTop: "1.5rem",
      paddingBottom: "1.5rem",
      color: "#9ca3af",
    },
    emptyStateText: {
      fontSize: "0.875rem",
    },
    closeButton: {
      position: "absolute" as const,
      top: "0.75rem", // Adjusted for padding
      right: "0.75rem", // Adjusted for padding
      zIndex: 10,
      backgroundColor: "transparent",
      border: "none",
      color: "#9ca3af",
      cursor: "pointer",
      padding: "0.25rem",
      borderRadius: "0.25rem",
      transition: "all 0.2s ease-in-out",
    },
    closeButtonHover: { // Added style for close button hover
      backgroundColor: "#e5e7eb",
      color: "#4b5563",
    }
  }

  return (
    <div style={styles.overlay}> {/* Use overlay style here */}
      <div style={styles.dialogContent} ref={componentRef}> {/* Attach ref here to the dialog content */}
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          style={styles.closeButton}
          onMouseEnter={(e) => {
            Object.assign((e.currentTarget as HTMLElement).style, styles.closeButtonHover)
          }}
          onMouseLeave={(e) => {
            ; (e.currentTarget as HTMLElement).style.backgroundColor = styles.closeButton.backgroundColor
              ; (e.currentTarget as HTMLElement).style.color = styles.closeButton.color
          }}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <label className="block text-sm font-semibold text-black mb-4">Users of {hostname}</label>
        {items.length > 0 && (
          <div style={styles.searchContainer}>
            <Search style={styles.searchIcon} />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: "2.5rem",
                backgroundColor: "#fff",
                color: "#000",
              }}
            />
          </div>
        )}

        {/* Input Section */}
        <div style={styles.inputGroup}>
          <Input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              backgroundColor: "#fff",
              color: "#000",
            }}
          />
          <Button
            onClick={handleAdd}
            size="icon"
            style={{ backgroundColor: "#000", color: "#fff" }}
            aria-label="Add item"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Items List */}
        {filteredItems.length > 0 && (
          <div style={styles.itemsContainer}>
            {displayItems.map((item, index) => (
              <div
                key={index}
                style={styles.itemRow}
                onMouseEnter={(e) => {
                  ; (e.currentTarget as HTMLElement).style.borderColor = styles.itemRowHover.borderColor
                    ; (e.currentTarget as HTMLElement).style.backgroundColor = styles.itemRowHover.backgroundColor
                  const btn = (e.currentTarget as HTMLElement).querySelector("button") as HTMLElement
                  if (btn) btn.style.opacity = "1"
                }}
                onMouseLeave={(e) => { // Corrected from onLeave
                  ; (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db"
                    ; (e.currentTarget as HTMLElement).style.backgroundColor = "#f3f4f6"
                  const btn = (e.currentTarget as HTMLElement).querySelector("button") as HTMLElement
                  if (btn) btn.style.opacity = "0"
                }}
              >
                <span style={styles.itemText}>{item}</span>
                <button
                  onClick={() => handleRemove(item)}
                  style={styles.removeButton}
                  onMouseEnter={(e) => {
                    ; (e.currentTarget as HTMLElement).style.backgroundColor = "#e5e7eb"
                      ; (e.currentTarget as HTMLElement).style.color = "#000"
                  }}
                  onMouseLeave={(e) => { // Corrected from onLeave
                    ; (e.currentTarget as HTMLElement).style.backgroundColor = "#f3f4f6"
                      ; (e.currentTarget as HTMLElement).style.color = "#4b5563"
                  }}
                  aria-label={`Remove ${item}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Expand/Collapse Button */}
            {hasMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={styles.expandButton}
                onMouseEnter={(e) => {
                  Object.assign((e.currentTarget as HTMLElement).style, styles.expandButtonHover)
                }}
                onMouseLeave={(e) => { // Corrected from onLeave
                  ; (e.currentTarget as HTMLElement).style.color = "#000"
                    ; (e.currentTarget as HTMLElement).style.backgroundColor = "#fff"
                    ; (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db"
                }}
              >
                {isExpanded
                  ? `← Collapse (${filteredItems.length - maxPreview} hidden)`
                  : `↓ Show all (${filteredItems.length} items)`}
              </button>
            )}

            {/* Item count indicator */}
            {!hasMore && (
              <div style={styles.itemCount}>
                {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateText}>No items.</p>
          </div>
        )}

        {items.length > 0 && filteredItems.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateText}>No items match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
