import { createSignal, createContext, useContext } from "solid-js";
import playerHopper from "~/components/eventManagement/playerHopper";
import {
  Pod,
  Player,
  PodSizes,
  Event,
  PodUpdateParam,
  SeatUpdateParam,
  FullSeat,
  ProxySeat,
  PlayerUpdateParam,
  SeatAddress,
  MatchUpdateParam,
  MatchData,
  EventUpdateParam,
} from "~/typing/eventTypes";

//Typing

export type EventState = [
  () => Event,
  {
    makeEvent: (newEvent: Event) => void;
    addPlayer: (name: string, seatAddress?: SeatAddress) => void;
    removePlayer: (playerId: number) => void;
    addSeat: (podId: number, seatNumber: number) => void;
    addPod: (
      inputPodSize: PodSizes,
      inputPodRounds: number,
      inputDraftTime: number,
      inputRoundTime: number
    ) => void;
    removePod: (inputPodId: number) => void;
    updateEvent: (updateParam: EventUpdateParam) => void;
    updatePodSize: (inputPodId: number, newPodSize: number) => void;
    updatePod: (inputPodId: number, updateParam: PodUpdateParam) => void;
    updateMatch: (
      inputPodId: number,
      inputMatchId: number,
      updateParam: MatchUpdateParam
    ) => void;
    updateSeat: (
      inputPodId: number,
      inputSeatNumber: number,
      updateParam: SeatUpdateParam
    ) => void;
    updatePlayer: (
      inputPlayerId: number,
      updateParam: PlayerUpdateParam
    ) => void;
    setPlayerHopperEl: (inputElement: HTMLDivElement) => void;
  }
];

//Create Sample Event

const SampleEvent: Event = {
  evtPods: [
    {
      podId: 1,
      podNumber: 1,
      podSize: 8,
      podSeats: [],
      podStatus: "seating",
      podRounds: 3,
      podDraftTime: 50,
      podRoundTime: 50,
      podMatches: [],
    },
  ],
  evtSeats: [],
  evtPlayerList: [
    {
      id: 0,
      name: "Keldan",
      podId: 1,
      seat: 1,
      podRecords: [],
    },
    {
      id: 1,
      name: "Colton",
      podId: 1,
      seat: 2,
      podRecords: [],
    },
    {
      id: 2,
      name: "Aiden",
      podId: 1,
      seat: 3,
      podRecords: [],
    },
    {
      id: 3,
      name: "Harrison",
      podId: 1,
      seat: 4,
      podRecords: [],
    },
    {
      id: 4,
      name: "Josh",
      podId: 1,
      seat: 5,
      podRecords: [],
    },
    {
      id: 5,
      name: "Daniel",
      podId: 1,
      seat: 6,
      podRecords: [],
    },
    {
      id: 6,
      name: "Jesse",
      podId: 1,
      seat: 7,
      podRecords: [],
    },
    {
      id: 7,
      name: "Jack",
      podId: 1,
      seat: 8,
      podRecords: [],
    },
  ],
  evtSettings: { playerCap: 0 },
  evtStage: "seating",
  evtLoading: true,
  nextPodId: 2,
  nextPlayerId: 8,
};

const EventContext = createContext<EventState | undefined>();

export function EventContextProvider(props: any) {
  const [event, setEvent] = createSignal<Event>(SampleEvent),
    eventState: EventState = [
      () => event(),
      {
        //MAKE EVENT
        makeEvent(newEvent) {
          setEvent(newEvent);
        },

        //ADD PLAYER
        addPlayer(name, seatAddress) {
          const newPlayer: Player = (() => {
            let tempPodId: number = 0;
            let tempSeat: number = 0;
            if (seatAddress) {
              tempPodId = seatAddress.podId;
              tempSeat = seatAddress.seat;
            }

            return {
              id: event().nextPlayerId,
              name: name,
              podId: tempPodId,
              seat: tempSeat,
              podRecords: [],
            };
          })();

          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };
            const storedId = newEvt.nextPlayerId;
            newEvt.evtPlayerList = [...newEvt.evtPlayerList, newPlayer];
            newEvt.nextPlayerId = storedId + 1;
            return newEvt;
          });
        },

        //REMOVE PLAYER
        removePlayer(playerId) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };

            const playerIndex = newEvt.evtPlayerList.findIndex(
              (player) => player.id === playerId
            );

            if (playerIndex !== -1) {
              newEvt.evtPlayerList.splice(playerIndex, 1);
            }

            return newEvt;
          });
        },

        //ADD SEAT
        addSeat(podId, seatNumber) {
          const newProxySeat: ProxySeat = {
            podId: podId,
            seatNumber: seatNumber,
          };

          const newFullSeat: FullSeat = {
            podId: podId,
            seatNumber: seatNumber,
            filled: false,
            hovered: false,
          };

          const podIndex = event().evtPods.findIndex(
            (pod) => pod.podId === podId
          );

          if (podIndex !== -1) {
            setEvent((prevEvt) => {
              const newEvt = { ...prevEvt };

              newEvt.evtSeats = [...newEvt.evtSeats, newProxySeat];

              newEvt.evtPods[podIndex].podSeats = [
                ...newEvt.evtPods[podIndex].podSeats,
                newFullSeat,
              ];
              return newEvt;
            });
          }
        },

        //ADD POD
        addPod(inputPodSize, inputPodRounds, inputDraftTime, inputRoundTime) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };

            const newFullSeats: FullSeat[] = (() => {
              const tempArray = [];
              for (let i = 1; i <= inputPodSize; i++) {
                const newFullSeat: FullSeat = {
                  podId: event().nextPodId,
                  seatNumber: i,
                  filled: false,
                  hovered: false,
                };
                tempArray.push(newFullSeat);
              }
              return tempArray;
            })();

            const newMarkerSeats: ProxySeat[] = (() => {
              const tempArray = [];
              for (let i = 1; i <= inputPodSize; i++) {
                const newFullSeat: ProxySeat = {
                  podId: event().nextPodId,
                  seatNumber: i,
                };
                tempArray.push(newFullSeat);
              }

              return tempArray;
            })();

            newEvt.evtSeats = [...newEvt.evtSeats, ...newMarkerSeats];

            const newPod: Pod = {
              podId: event().nextPodId,
              podNumber: newEvt.evtPods.length + 1,
              podSize: inputPodSize,
              podSeats: newFullSeats,
              podStatus: "seating",
              podRounds: inputPodRounds,
              podDraftTime: inputDraftTime,
              podRoundTime: inputRoundTime,
              podMatches: [],
            };

            newEvt.evtPods = [...newEvt.evtPods, newPod];
            const newId = event().nextPodId + 1;
            newEvt.nextPodId = newId;
            return newEvt;
          });
        },

        //REMOVE POD
        removePod(inputPodId) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };

            const podIndexToRemove = newEvt.evtPods.findIndex(
              (pod) => pod.podId === inputPodId
            );
            //remove all proxy seats
            newEvt.evtSeats = newEvt.evtSeats.filter(
              (seat) => seat.podId !== inputPodId
            );
            //remove the pod
            if (podIndexToRemove !== -1) {
              newEvt.evtPods.splice(podIndexToRemove, 1);
            }

            //update pod #s
            newEvt.evtPods.map((pod, index) => {
              if (pod.podNumber !== index + 1) {
                newEvt.evtPods[index].podNumber = index + 1;
              }
            });

            return newEvt;
          });
        },

        //UPDATE EVENT
        updateEvent(updateParam) {
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };

            if ("evtLoading" in updateParam) {
              newEvt.evtLoading = updateParam.evtLoading;
            } else if ("owner" in updateParam) {
              newEvt.evtControllerOwner = updateParam.owner;
            }

            return newEvt;
          });
        },

        //UPDATE POD SIZE
        updatePodSize(inputPodId, newPodSize) {
          const podToEdit = event().evtPods.find(
            (pod) => pod.podId === inputPodId
          );
          const podToEditIndex = event().evtPods.findIndex(
            (pod) => pod.podId === inputPodId
          );

          if (podToEdit && podToEditIndex >= 0) {
            podToEdit.podSize = newPodSize as PodSizes;
            const podDifference = podToEdit.podSize - podToEdit.podSeats.length;
            if (podDifference > 0) {
              setEvent((prevEvt) => {
                const newEvt = { ...prevEvt };
                const seatsStartingLength = podToEdit.podSeats.length;

                //add new fullSeats
                for (let i = 1; i <= podDifference; i++) {
                  const newSeat: FullSeat = {
                    podId: inputPodId,
                    seatNumber: seatsStartingLength + i,
                    filled: false,
                    hovered: false,
                  };
                  newEvt.evtPods[podToEditIndex].podSeats = [
                    ...newEvt.evtPods[podToEditIndex].podSeats,
                    newSeat,
                  ];
                }

                //add new proxySeats
                for (let i = 1; i <= podDifference; i++) {
                  const newSeat: ProxySeat = {
                    podId: inputPodId,
                    seatNumber: seatsStartingLength + i,
                  };
                  newEvt.evtSeats = [...newEvt.evtSeats, newSeat];
                }
                return newEvt;
              });
            } else if (podDifference < 0) {
              const seatNumToCut = Math.abs(podDifference);
              const seatsStartingLength = podToEdit.podSeats.length;
              setEvent((preEvt) => {
                const newEvt = { ...preEvt };

                //remove fullSeats
                newEvt.evtPods[podToEditIndex].podSeats = [
                  ...newEvt.evtPods[podToEditIndex].podSeats.slice(
                    0,
                    seatsStartingLength - seatNumToCut
                  ),
                ];

                //remove proxySeats

                newEvt.evtSeats = newEvt.evtSeats.filter(
                  (seat) =>
                    seat.podId !== inputPodId ||
                    (seat.podId === inputPodId &&
                      seat.seatNumber <= seatsStartingLength - seatNumToCut)
                );

                return newEvt;
              });
            } else {
            }
          }
        },

        //UPDATE POD
        updatePod(inputPodId: number, updateParam: PodUpdateParam) {
          const podIndex = event().evtPods.findIndex(
            (pod) => pod.podId === inputPodId
          );

          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };
            if (podIndex !== -1) {
              if ("status" in updateParam) {
                const scopedParam = updateParam.status;

                newEvt.evtPods[podIndex] = {
                  ...newEvt.evtPods[podIndex],
                  podStatus: scopedParam,
                };
              } else if ("round" in updateParam) {
                const scopedParam = updateParam.round;

                newEvt.evtPods[podIndex] = {
                  ...newEvt.evtPods[podIndex],
                  currentRound: scopedParam,
                };
              } else if ("newMatch" in updateParam) {
                const scopedParam = updateParam.newMatch;

                newEvt.evtPods[podIndex].podMatches = [
                  ...newEvt.evtPods[podIndex].podMatches,
                  scopedParam,
                ];
              } else if ("hovered" in updateParam) {
                const scopedParam = updateParam.hovered;

                newEvt.evtPods[podIndex].podHovered = scopedParam;
              } else if ("byePlayer" in updateParam) {
                const scopedParam = updateParam.byePlayer;

                if (!newEvt.evtPods[podIndex].byePlayerIds) {
                  newEvt.evtPods[podIndex].byePlayerIds = [scopedParam];
                } else if (
                  newEvt.evtPods[podIndex].byePlayerIds!.filter(
                    (id) => id === scopedParam
                  ).length === 0
                ) {
                  newEvt.evtPods[podIndex].byePlayerIds!.push(scopedParam);
                }
              } else if ("ref" in updateParam) {
                const scopedParam = updateParam.ref;

                newEvt.evtPods[podIndex].podRef = scopedParam;
              } else if ("menuOpen" in updateParam) {
                newEvt.evtPods[podIndex].menuOpen = updateParam.menuOpen;
              } else if ("overlayOpen" in updateParam) {
                newEvt.evtPods[podIndex].overlayOpen = updateParam.overlayOpen;
              } else if ("podOwner" in updateParam) {
                newEvt.evtPods[podIndex].podOwner = updateParam.podOwner;
              }
            }
            return newEvt;
          });
        },

        //UPDATE Match
        updateMatch(
          inputPodId: number,
          inputMatchId: number,
          updateParam: MatchUpdateParam
        ) {
          const podIndex = event().evtPods.findIndex(
            (pod) => pod.podId === inputPodId
          );

          const matchIndex = event().evtPods[podIndex].podMatches.findIndex(
            (match) => match.matchId === inputMatchId
          );

          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };
            if (podIndex !== -1 && matchIndex !== -1) {
              if ("winner" in updateParam) {
                const scopedParam = updateParam.winner;

                newEvt.evtPods[podIndex].podMatches[matchIndex] = {
                  ...newEvt.evtPods[podIndex].podMatches[matchIndex],
                  winner: scopedParam,
                };
              } else if ("matchRecord" in updateParam) {
                const scopedParam = updateParam.matchRecord;

                newEvt.evtPods[podIndex].podMatches[matchIndex] = {
                  ...newEvt.evtPods[podIndex].podMatches[matchIndex],
                  p1Score: scopedParam.p1,
                  p2Score: scopedParam.p2,
                };
              }
            }
            return newEvt;
          });
        },

        //UPDATE SEAT
        updateSeat(
          inputPodId: number,
          inputSeatNumber: number,
          updateParam: SeatUpdateParam
        ) {
          const podIndex = event().evtPods.findIndex(
            (pod) => pod.podId === inputPodId
          );
          const seatIndex = event().evtPods[podIndex].podSeats.findIndex(
            (seat) => seat.seatNumber === inputSeatNumber
          );

          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };
            if (seatIndex !== -1) {
              if ("ref" in updateParam) {
                const scopedParam: HTMLDivElement = updateParam.ref;

                newEvt.evtPods[podIndex].podSeats[seatIndex].seatRef =
                  scopedParam;
              } else if ("filled" in updateParam) {
                const scopedParam: boolean = updateParam.filled;

                newEvt.evtPods[podIndex].podSeats[seatIndex].filled =
                  scopedParam;
              } else if ("hovered" in updateParam) {
                const scopedParam: boolean = updateParam.hovered;

                newEvt.evtPods[podIndex].podSeats[seatIndex] = {
                  ...event().evtPods[podIndex].podSeats[seatIndex],
                  hovered: scopedParam,
                };
              }
            }
            return newEvt;
          });
        },

        //UPDATE PLAYER
        updatePlayer(inputPlayerId, updateParam) {
          const playerIndex = event().evtPlayerList.findIndex(
            (player) => player.id === inputPlayerId
          );
          setEvent((prevEvt) => {
            const newEvt = { ...prevEvt };

            if (playerIndex !== -1) {
              const thisPlayer = newEvt.evtPlayerList[playerIndex];
              if ("address" in updateParam) {
                newEvt.evtPlayerList[playerIndex] = {
                  ...newEvt.evtPlayerList[playerIndex],
                  podId: updateParam.address.podId,
                  seat: updateParam.address.seat,
                };
              } else if ("fullPodRecord" in updateParam) {
                const inputRecord = updateParam.fullPodRecord;
                const updateRecordIndex = newEvt.evtPlayerList[
                  playerIndex
                ].podRecords.findIndex(
                  (record) => record.podId === inputRecord.podId
                );
                if (updateRecordIndex !== -1) {
                  newEvt.evtPlayerList[playerIndex].podRecords.splice(
                    updateRecordIndex,
                    1
                  );
                  newEvt.evtPlayerList[playerIndex].podRecords = [
                    ...newEvt.evtPlayerList[playerIndex].podRecords,
                    inputRecord,
                  ];
                } else {
                  newEvt.evtPlayerList[playerIndex].podRecords = [
                    ...newEvt.evtPlayerList[playerIndex].podRecords,
                    inputRecord,
                  ];
                }
              } else if ("matchRecord" in updateParam) {
                const podRecordIndex = newEvt.evtPlayerList[
                  playerIndex
                ].podRecords.findIndex(
                  (record) => updateParam.matchRecord.podId === record.podId
                );

                const newRecord = updateParam.matchRecord.result;

                if (podRecordIndex !== -1) {
                  const podRecordToUpdate =
                    thisPlayer.podRecords[podRecordIndex];
                  if ("w" in newRecord) {
                    const newWinValue = podRecordToUpdate.w + newRecord.w;
                    thisPlayer.podRecords[podRecordIndex] = {
                      ...thisPlayer.podRecords[podRecordIndex],
                      w: newWinValue,
                    };
                  } else if ("l" in newRecord) {
                    const newLossValue = podRecordToUpdate.l + newRecord.l;
                    thisPlayer.podRecords[podRecordIndex] = {
                      ...thisPlayer.podRecords[podRecordIndex],
                      l: newLossValue,
                    };
                  } else if ("d" in newRecord) {
                    const newDrawValue = podRecordToUpdate.d + newRecord.d;
                    thisPlayer.podRecords[podRecordIndex] = {
                      ...thisPlayer.podRecords[podRecordIndex],
                      d: newDrawValue,
                    };
                  }
                }
              } else if ("lastEvent" in updateParam) {
                newEvt.evtPlayerList[playerIndex] = {
                  ...newEvt.evtPlayerList[playerIndex],
                  lastEvent: updateParam.lastEvent,
                };
              } else if ("lastSeat" in updateParam) {
                newEvt.evtPlayerList[playerIndex] = {
                  ...newEvt.evtPlayerList[playerIndex],
                  lastSeat: updateParam.lastSeat,
                };
              } else if ("lastLoc" in updateParam) {
                newEvt.evtPlayerList[playerIndex] = {
                  ...newEvt.evtPlayerList[playerIndex],
                  lastLoc: updateParam.lastLoc,
                };
              } else if ("currentRef" in updateParam) {
                newEvt.evtPlayerList[playerIndex] = {
                  ...newEvt.evtPlayerList[playerIndex],
                  currentRef: updateParam.currentRef,
                };
              } else if ("menuOpen" in updateParam) {
                newEvt.evtPlayerList[playerIndex] = {
                  ...newEvt.evtPlayerList[playerIndex],
                  menuOpen: updateParam.menuOpen,
                };
              } else if ("name" in updateParam) {
                newEvt.evtPlayerList[playerIndex] = {
                  ...newEvt.evtPlayerList[playerIndex],
                  name: updateParam.name,
                };
              }

              return newEvt;
            } else {
              return newEvt;
            }
          });
        },

        //SET ELEMENT FOR PLAYER HOPPER
        setPlayerHopperEl(inputElement) {
          setEvent((prevEvt) => {
            const newEvt: Event = { ...prevEvt, playerHopper: inputElement };
            return newEvt;
          });
        },
      },
    ];

  return (
    <EventContext.Provider value={eventState}>
      {props.children}
    </EventContext.Provider>
  );
}

export function useEventContext() {
  return useContext(EventContext)!;
}
