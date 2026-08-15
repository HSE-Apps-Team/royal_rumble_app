"use client";

import React from "react";

export interface ProgressStop {
  key: string;
  label: string;
  present: boolean;
}

export interface ProgressBlock {
  key: string;
  label: string;
  present: boolean;
  isTour: boolean;
  stops: ProgressStop[];
}

export interface RouteProgressProps {
  routeName?: string;
  blocks: ProgressBlock[];
  bordered?: boolean;
}

const DONE_COLOR = "var(--primaryBlue)";
const UPCOMING_COLOR = "var(--secondarySilver)";

type NodeState = "done" | "current" | "upcoming";

function getState(present: boolean, isCurrent: boolean): NodeState {
  if (present) return "done";
  if (isCurrent) return "current";
  return "upcoming";
}

function Node({ state, size }: { state: NodeState; size: number }) {
  const color = state === "upcoming" ? UPCOMING_COLOR : DONE_COLOR;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: state === "done" ? color : "white",
        border: `2px solid ${color}`,
        zIndex: 1,
      }}
    >
      {state === "done" && (
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8.5L6.2 11.7L13 4.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {state === "current" && (
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8H13M13 8L9 4M13 8L9 12"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function Connector({ dashed }: { dashed: boolean }) {
  return (
    <div
      style={{
        width: 2,
        flex: 1,
        minHeight: 16,
        backgroundColor: dashed ? "transparent" : DONE_COLOR,
        backgroundImage: dashed
          ? `linear-gradient(${UPCOMING_COLOR} 60%, transparent 40%)`
          : undefined,
        backgroundSize: dashed ? "2px 10px" : undefined,
        backgroundRepeat: dashed ? "repeat-y" : undefined,
      }}
    />
  );
}

export default function RouteProgress({
  routeName,
  blocks,
  bordered = true,
}: RouteProgressProps) {
  const firstIncompleteBlockIndex = blocks.findIndex((b) => !b.present);

  return (
    <div
      style={{
        width: bordered ? "85%" : "100%",
        margin: bordered ? "20px auto" : "0",
        backgroundColor: "white",
        border: bordered ? "4px solid var(--primaryBlue)" : "none",
        fontFamily: "Poppins, sans-serif",
        padding: bordered ? "24px" : "8px 0",
      }}
    >
      {routeName && (
        <div
          style={{
            color: "var(--primaryBlue)",
            fontWeight: "bold",
            fontSize: "22px",
            marginBottom: "24px",
          }}
        >
          {routeName}
        </div>
      )}

      {blocks.map((block, blockIndex) => {
        const isLastBlock = blockIndex === blocks.length - 1;
        const isCurrent = blockIndex === firstIncompleteBlockIndex;
        const state = getState(block.present, isCurrent);
        const hasNestedStops = block.isTour && block.stops.length > 0;
        // Stops only get their own current/upcoming distinction once the
        // Tour block itself has actually started (current or done) —
        // otherwise every stop is just upcoming, same as the block.
        const stopsActive = state === "current" || state === "done";
        const firstIncompleteStopIndex = hasNestedStops && stopsActive
          ? block.stops.findIndex((s) => !s.present)
          : -1;

        return (
          <div key={block.key} style={{ display: "flex" }}>
            {/* Rail */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginRight: "16px",
              }}
            >
              <Node state={state} size={28} />
              {(!isLastBlock || hasNestedStops) && (
                <Connector dashed={state !== "done"} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: "24px" }}>
              <div
                style={{
                  fontWeight: isCurrent ? "bold" : "normal",
                  fontSize: "18px",
                  color:
                    state === "upcoming" ? UPCOMING_COLOR : "var(--textBlack)",
                  minHeight: 28,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {block.label}
              </div>

              {hasNestedStops && (
                <div style={{ marginTop: "16px" }}>
                  {block.stops.map((stop, stopIndex) => {
                    const isLastStop = stopIndex === block.stops.length - 1;
                    const isCurrentStop = stopIndex === firstIncompleteStopIndex;
                    const stopState = getState(stop.present, isCurrentStop);

                    return (
                      <div key={stop.key} style={{ display: "flex" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginRight: "14px",
                          }}
                        >
                          <Node state={stopState} size={18} />
                          {!isLastStop && (
                            <Connector dashed={stopState !== "done"} />
                          )}
                        </div>
                        <div
                          style={{
                            paddingBottom: "14px",
                            fontSize: "15px",
                            fontWeight: isCurrentStop ? "bold" : "normal",
                            color:
                              stopState === "upcoming"
                                ? UPCOMING_COLOR
                                : "var(--textBlack)",
                            minHeight: 18,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {stop.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
