"use client";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import { Character, type CharacterHandle } from "./Character";

export interface RemotePlayer {
  playerId: number;
  name: string;
  skinId: string;
  x: number;
  y: number;
  z: number;
  ry: number;
}

/** Удалённый игрок: интерполяция к последней известной позиции (сглаживание сетевых тиков). */
function Remote({ p }: { p: RemotePlayer }) {
  const g = useRef<THREE.Group>(null!);
  const char = useRef<CharacterHandle>(null);
  const target = useRef(new THREE.Vector3(p.x, p.y, p.z));
  target.current.set(p.x, p.y, p.z);
  const init = useRef(false);

  useFrame((_, dt) => {
    if (!init.current) {
      g.current.position.copy(target.current);
      init.current = true;
    }
    const before = g.current.position.clone();
    g.current.position.lerp(target.current, 1 - Math.exp(-dt * 6));
    const speed = before.distanceTo(g.current.position) / Math.max(dt, 0.001);
    if (char.current) char.current.speed = Math.min(1, speed / 7);
    let dy = p.ry - g.current.rotation.y;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    g.current.rotation.y += dy * Math.min(1, dt * 8);
  });

  return (
    <group ref={g}>
      <Character ref={char} skinId={p.skinId} weapon={false} castShadow={false} />
      <Billboard position={[0, 2.15, 0]}>
        <Text fontSize={0.26} color="#ffffff" outlineWidth={0.025} outlineColor="#0891b2" anchorY="bottom">
          {p.name}
        </Text>
      </Billboard>
    </group>
  );
}

export function RemotePlayers({ players }: { players: RemotePlayer[] }) {
  return (
    <>
      {players.map((p) => (
        <Remote key={p.playerId} p={p} />
      ))}
    </>
  );
}
