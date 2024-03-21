import "./playerCard.css"

interface PlayerCardInputs {
    name: string
}

export default function PlayerCard({name}: PlayerCardInputs) {
    return (
        <div class="playerCardContainer">
            <div class="playerIcon"></div>
            <div class="playerName">{name}</div>
        </div>
    )
}