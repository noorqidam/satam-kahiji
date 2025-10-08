<?php

namespace Database\Factories;

use App\Models\Facility;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Facility>
 */
class FacilityFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Facility::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $facilityTypes = [
            'Library', 'Computer Lab', 'Science Lab', 'Art Room', 'Music Room',
            'Gymnasium', 'Auditorium', 'Cafeteria', 'Chapel', 'Sports Field',
            'Swimming Pool', 'Basketball Court', 'Playground', 'Garden',
            'Meeting Room', 'Conference Room', 'Study Hall'
        ];

        $facilityName = $this->faker->randomElement($facilityTypes);

        return [
            'name' => $facilityName,
            'description' => $this->faker->paragraph(3),
            'photo' => $this->faker->optional(0.3)->imageUrl(640, 480, 'building'),
            'metadata' => $this->faker->optional(0.3)->randomElement([
                [
                    'width' => 640,
                    'height' => 480,
                    'dimensions' => '640x480',
                    'file_size' => $this->faker->numberBetween(50000, 500000),
                    'file_size_human' => $this->faker->randomElement(['127 KB', '234 KB', '456 KB']),
                    'original_name' => $this->faker->word . '.jpg',
                    'extension' => 'jpg',
                    'file_id' => $this->faker->uuid,
                ],
                null
            ]),
        ];
    }

    /**
     * Indicate that the facility has a photo.
     */
    public function withPhoto(): static
    {
        return $this->state(fn (array $attributes) => [
            'photo' => 'https://drive.google.com/uc?id=' . $this->faker->uuid . '&export=view',
            'metadata' => [
                'width' => 800,
                'height' => 600,
                'dimensions' => '800x600',
                'file_size' => 250000,
                'file_size_human' => '244 KB',
                'original_name' => strtolower(str_replace(' ', '_', $attributes['name'])) . '.jpg',
                'extension' => 'jpg',
                'file_id' => $this->faker->uuid,
            ],
        ]);
    }

    /**
     * Indicate that the facility has no photo.
     */
    public function withoutPhoto(): static
    {
        return $this->state(fn (array $attributes) => [
            'photo' => null,
            'metadata' => null,
        ]);
    }
}