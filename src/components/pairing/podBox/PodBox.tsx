import "./podBox.css"
import PlayerCard from "../playerCard"

export default function PodBox() {
    return (
        <div class="podBoxContainer">
            <PlayerCard name="Keldan"/>
            <PlayerCard name="Aiden"/>
            <PlayerCard name="Colton"/>
            <PlayerCard name="Harrison"/>
            <PlayerCard name="Daniel"/>
            <PlayerCard name="Josh"/>
            <PlayerCard name="Jack"/>
            <PlayerCard name="Braeden"/>
        </div>
    )
}