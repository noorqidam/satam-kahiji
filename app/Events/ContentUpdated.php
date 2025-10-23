<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContentUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $contentType;
    public $action;
    public $id;
    public $title;

    /**
     * Create a new event instance.
     */
    public function __construct(string $contentType, string $action, int $id, ?string $title = null)
    {
        $this->contentType = $contentType; // 'post', 'gallery', 'facility', 'extracurricular', 'page', etc.
        $this->action = $action; // 'created', 'updated', 'deleted', 'published', 'unpublished'
        $this->id = $id;
        $this->title = $title;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('content-updates'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'content.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'contentType' => $this->contentType,
            'action' => $this->action,
            'id' => $this->id,
            'title' => $this->title,
            'timestamp' => now()->toISOString(),
        ];
    }
}